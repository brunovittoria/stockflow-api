import { UseCase as UseCaseInterface } from '@/shared/application/usecases/use-case'
import {
  PurchaseOrderEntity,
  PurchaseOrderItem,
  PurchaseOrderStatus,
} from '@/purchase-orders/domain/entities/purchase-order.entity'
import { PurchaseOrderRepository } from '@/purchase-orders/domain/repositories/purchase-order.repository'

/**
 * CreatePurchaseOrderUseCase
 *
 * Registra um novo pedido de compra no sistema.
 * Um fornecedor pode ter múltiplos pedidos de compra — não há restrição de unicidade.
 *
 * Regras de negócio aplicadas:
 *  - Itens não podem ser vazios (validado pela entidade)
 *  - Cada item deve ter productId, quantity > 0 e unitCost > 0 (validado pela entidade)
 *  - totalCost é calculado automaticamente pela entidade (sum of quantity * unitCost)
 *  - Status inicial é sempre DRAFT
 *
 * Fluxo:
 *  1. Cria a entidade (validações do domínio e cálculo de totalCost rodam aqui)
 *  2. Persiste via repositório
 *  3. Retorna os dados do pedido criado
 */

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace CreatePurchaseOrderUseCase {
  export interface Input {
    supplierId: string
    items: PurchaseOrderItem[]
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
      const purchaseOrder = new PurchaseOrderEntity({
        supplierId: input.supplierId,
        items: input.items,
      })

      await this.purchaseOrderRepository.insert(purchaseOrder)

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
