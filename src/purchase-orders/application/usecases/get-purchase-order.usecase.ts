import { UseCase as UseCaseInterface } from '@/shared/application/usecases/use-case'
import {
  PurchaseOrderItem,
  PurchaseOrderStatus,
} from '@/purchase-orders/domain/entities/purchase-order.entity'
import { PurchaseOrderRepository } from '@/purchase-orders/domain/repositories/purchase-order.repository'
import { NotFoundError } from '@/shared/domain/errors/not-found-error'

/**
 * GetPurchaseOrderUseCase
 *
 * Busca um pedido de compra específico pelo ID e retorna seus dados completos.
 *
 * Regras de negócio aplicadas:
 *  - Lança NotFoundError se o pedido não for encontrado
 *
 * Fluxo:
 *  1. Busca o pedido pelo ID no repositório
 *  2. Lança NotFoundError se não existir
 *  3. Retorna os dados completos do pedido mapeados para um objeto plano
 */

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace GetPurchaseOrderUseCase {
  export interface Input {
    id: string
  }

  export interface Output {
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
        throw new NotFoundError(`Purchase order not found for id ${input.id}`)
      }

      return {
        id: purchaseOrder.id,
        supplierId: purchaseOrder.supplierId,
        status: purchaseOrder.status,
        items: purchaseOrder.items,
        totalCost: purchaseOrder.totalCost,
        createdAt: purchaseOrder.createdAt,
        updatedAt: purchaseOrder.updatedAt,
      }
    }
  }
}
