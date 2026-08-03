import { UseCase as UseCaseInterface } from '@/shared/application/usecases/use-case'
import { PurchaseOrderRepository } from '@/purchase-orders/domain/repositories/purchase-order.repository'
import { StockRepository } from '@/stock/domain/repositories/stock.repository'
import { NotFoundError, ConflictError } from '@/shared/domain/errors'
import { PurchaseOrderStatus } from '@/purchase-orders/domain/entities/purchase-order.entity'

/**
 * ReceiveDeliveryUseCase
 *
 * Representa o momento em que a empresa recebe uma entrega do fornecedor.
 *
 * Regras de negócio aplicadas:
 *  - Lança NotFoundError se o pedido não for encontrado
 *  - Lança ConflictError se o pedido não estiver com status SENT
 *  - Lança NotFoundError se o estoque de algum item não for encontrado
 *
 * Fluxo:
 *  1. Busca o pedido de compra pelo ID
 *  2. Lança ConflictError se o status não for SENT
 *  3. Marca o pedido como DELIVERED via entity.markAsDelivered()
 *  4. Para cada item do pedido, localiza o estoque do produto e adiciona
 *     a quantidade recebida (addQuantity)
 *  5. Persiste cada estoque atualizado
 *  6. Persiste o pedido atualizado
 *  7. Retorna o id, status e os estoques atualizados
 *
 * Importante: este use case AUMENTA o estoque — não diminui.
 * A diminuição ocorre em um use case de venda (ex: SellProductUseCase),
 * quando a empresa vende para um cliente.
 */

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace ReceiveDeliveryUseCase {
  export interface Input {
    purchaseOrderId: string
  }

  export interface Output {
    id: string
    status: PurchaseOrderStatus
    updatedStockItems: Array<{ productId: string; newQuantity: number }>
  }

  export class UseCase implements UseCaseInterface<Input, Output> {
    constructor(
      private purchaseOrderRepo: PurchaseOrderRepository,
      private stockRepo: StockRepository,
    ) {}

    async execute(input: Input): Promise<Output> {
      const order = await this.purchaseOrderRepo.findById(input.purchaseOrderId)

      if (!order) {
        throw new NotFoundError(
          `Purchase order not found for id ${input.purchaseOrderId}`,
        )
      }

      if (order.status !== 'SENT') {
        throw new ConflictError(
          `Cannot receive delivery for a purchase order with status ${order.status}. Order must be SENT first.`,
        )
      }

      order.markAsDelivered()

      const updatedStockItems: Array<{
        productId: string
        newQuantity: number
      }> = []

      for (const item of order.items) {
        const stocks = await this.stockRepo.findByProductId(item.productId)
        const stock = stocks[0]

        if (!stock) {
          throw new NotFoundError(
            `Stock not found for product ${item.productId}`,
          )
        }

        stock.addQuantity(item.quantity)
        await this.stockRepo.update(stock)

        updatedStockItems.push({
          productId: item.productId,
          newQuantity: stock.quantity,
        })
      }

      await this.purchaseOrderRepo.update(order)

      return {
        id: order.id,
        status: order.status,
        updatedStockItems,
      }
    }
  }
}
