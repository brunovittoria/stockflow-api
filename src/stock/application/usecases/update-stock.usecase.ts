import { UseCase as UseCaseInterface } from '@/shared/application/usecases/use-case'
import { StockRepository } from '@/stock/domain/repositories/stock.repository'
import { NotFoundError } from '@/shared/domain/errors'
import { StockEntity } from '@/stock/domain/entities/stock.entity'
import { CacheProvider } from '@/shared/application/cache/cache-provider'
import { CacheKeys } from '@/shared/application/cache/cache-keys'

/**
 * UpdateStockUseCase
 *
 * Atualiza os dados editáveis de um estoque existente.
 * productId é imutável e não pode ser alterado.
 *
 * Regras de negócio aplicadas:
 *  - Lança NotFoundError se o estoque não for encontrado
 *  - Quantidade não pode ser negativa (validado pela entidade)
 *
 * Fluxo:
 *  1. Busca o estoque pelo ID no repositório
 *  2. Lança NotFoundError se não existir
 *  3. Chama os métodos de atualização da entidade (validações do domínio rodam aqui)
 *  4. Persiste via repositório
 *  5. Retorna os dados do estoque atualizado
 */

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace UpdateStockUseCase {
  export interface Input {
    id: string
    location: string
    quantity: number
    minQuantity: number
    isActive: boolean
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
    constructor(
      private stockRepository: StockRepository,
      private cache: CacheProvider,
    ) {}

    async execute(input: Input): Promise<Output> {
      const stock: StockEntity = await this.stockRepository.findById(input.id)

      if (!stock) {
        throw new NotFoundError(`Stock not found for id ${input.id}`)
      }

      stock.updateQuantity(input.quantity)
      stock.updateMinQuantity(input.minQuantity)
      stock.updateLocation(input.location)

      if (input.isActive) {
        stock.activate()
      } else {
        stock.deactivate()
      }

      await this.stockRepository.update(stock)

      await this.cache.del(CacheKeys.stock(stock.id))
      await this.cache.del(CacheKeys.stocksCritical())

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
