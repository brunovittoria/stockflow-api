import { UseCase as UseCaseInterface } from '@/shared/application/usecases/use-case'
import { PurchaseOrderRepository } from '@/purchase-orders/domain/repositories/purchase-order.repository'
import { NotFoundError, ConflictError } from '@/shared/domain/errors'
import {
  PurchaseOrderEntity,
  PurchaseOrderItem,
  PurchaseOrderStatus,
} from '@/purchase-orders/domain/entities/purchase-order.entity'

/**
 * CancelPurchaseOrderUseCase
 *
 * Cancela um pedido de compra existente, alterando seu status para 'CANCELLED'.
 *
 * Regras de negócio aplicadas:
 *  - Lança NotFoundError se o pedido não for encontrado
 *  - Lança ConflictError se o pedido já estiver DELIVERED ou CANCELLED
 *  - Só é possível cancelar pedidos com status DRAFT ou SENT
 *
 * Fluxo:
 *  1. Busca o pedido de compra pelo ID no repositório
 *  2. Lança NotFoundError se não existir
 *  3. Lança ConflictError se o status não permitir cancelamento
 *  4. Chama entity.cancel() para transicionar o status para CANCELLED
 *  5. Persiste a mudança via repositório (update)
 *  6. Retorna o pedido cancelado como objeto plano
 */

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace CancelPurchaseOrderUseCase {
  export type Input = {
    id: string
  }

  export type Output = {
    id: string
    supplierId: string
    status: PurchaseOrderStatus
    items: PurchaseOrderItem[]
    totalCost: number
    createdAt: Date
    updatedAt: Date
  }

  export class UseCase implements UseCaseInterface<Input, Output> {
    constructor(private purchaseOrderRepository: PurchaseOrderRepository) {}

    async execute(input: Input): Promise<Output> {
      const purchaseOrder = await this.purchaseOrderRepository.findById(
        input.id,
      )

      if (!purchaseOrder) {
        throw new NotFoundError('Purchase order not found')
      }

      if (
        purchaseOrder.status === 'DELIVERED' ||
        purchaseOrder.status === 'CANCELLED'
      ) {
        throw new ConflictError(
          `Cannot cancel a purchase order with status ${purchaseOrder.status}`,
        )
      }

      purchaseOrder.cancel()
      await this.purchaseOrderRepository.update(purchaseOrder)

      return this.toOutput(purchaseOrder)
    }

    private toOutput(entity: PurchaseOrderEntity): Output {
      return {
        id: entity.id,
        supplierId: entity.supplierId,
        status: entity.status,
        items: entity.items,
        totalCost: entity.totalCost,
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt,
      }
    }
  }
}
