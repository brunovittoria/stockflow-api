import { UseCase as UseCaseInterface } from '@/shared/application/usecases/use-case'
import { StockRepository } from '@/stock/domain/repositories/stock.repository'
import { NotFoundError } from '@/shared/domain/errors'

/**
 * GetStockUseCase
 *
 * Obtém os dados completos de um estoque existente.
 *
 * Regras de negócio aplicadas:
 *  - Lança NotFoundError se o estoque não for encontrado
 *
 * Fluxo:
 *  1. Busca o estoque pelo ID no repositório
 *  2. Lança NotFoundError se não existir
 *  3. Retorna os dados completos do estoque
 */

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace GetStockUseCase {
  export interface Input {
    id: string
  }

  export interface Output {
    id: string
    productId: string
    location: string
    quantity: number
    minQuantity: number
    isActive: boolean
    createdAt: Date
    updatedAt: Date
  }

  export class UseCase implements UseCaseInterface<Input, Output> {
    constructor(private stockRepository: StockRepository) {}

    async execute(input: Input): Promise<Output> {
      const stock = await this.stockRepository.findById(input.id)

      if (!stock) {
        throw new NotFoundError(`Stock not found for id ${input.id}`)
      }

      return {
        id: stock.id,
        productId: stock.productId,
        location: stock.location,
        quantity: stock.quantity,
        minQuantity: stock.minQuantity,
        isActive: stock.isActive,
        createdAt: stock.createdAt,
        updatedAt: stock.updatedAt,
      }
    }
  }
}
