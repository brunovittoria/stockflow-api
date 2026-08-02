import { UseCase as UseCaseInterface } from '@/shared/application/usecases/use-case'
import { PurchaseOrderRepository } from '../../domain/repositories/purchase-order.repository'
import { StockRepository } from '@/stock/domain/repositories/stock.repository'
import { NotFoundError } from '@/shared/domain/errors/not-found-error'
import { PurchaseOrderStatus } from '@/purchase-orders/domain/entities/purchase-order.entity'

/**
 * ReceiveDeliveryUseCase
 *
 * Representa o momento em que a empresa recebe uma entrega do fornecedor.
 *
 * Fluxo:
 *  1. Busca o pedido de compra pelo ID
 *  2. Marca o pedido como DELIVERED
 *  3. Para cada item do pedido, localiza o estoque do produto e adiciona
 *     a quantidade recebida (addQuantity)
 *  4. Persiste o pedido atualizado
 *
 * Importante: este use case aumenta o estoque — não diminui.
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
      // 1. Buscar pedido de compra
      const order = await this.purchaseOrderRepo.findById(input.purchaseOrderId)

      if (!order) {
        throw new NotFoundError(
          `Purchase order not found for id ${input.purchaseOrderId}`,
        )
      }

      // 2. Mudar status para DELIVERED (entidade valida transição)
      order.markAsDelivered()

      // 3. Atualizar estoque de cada item
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

      // 4. Persistir pedido atualizado
      await this.purchaseOrderRepo.update(order)

      return {
        id: order.id,
        status: order.status,
        updatedStockItems,
      }
    }
  }
}
