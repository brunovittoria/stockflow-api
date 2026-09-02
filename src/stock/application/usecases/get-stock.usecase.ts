import { UseCase as UseCaseInterface } from '@/shared/application/usecases/use-case'
import { StockRepository } from '@/stock/domain/repositories/stock.repository'
import { NotFoundError } from '@/shared/domain/errors'
import { CacheProvider } from '@/shared/application/cache/cache-provider'
import { CacheKeys, CacheTtl } from '@/shared/application/cache/cache-keys'

/**
 * GetStockUseCase
 *
 * Obtém os dados completos de um estoque existente.
 *
 * Regras de negócio aplicadas:
 *  - Lança NotFoundError se o estoque não for encontrado
 *  - 404 não é gravado no cache
 *
 * Fluxo:
 *  1. Tenta ler stock:{id} no cache
 *  2. Hit → devolve sem ir ao repositório
 *  3. Miss → busca no repositório
 *  4. Lança NotFoundError se não existir
 *  5. Grava no cache com TTL e retorna
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
    constructor(
      private stockRepository: StockRepository,
      private cache: CacheProvider,
    ) {}

    async execute(input: Input): Promise<Output> {
      const cacheKey = CacheKeys.stock(input.id)
      const cached = await this.cache.get<Output>(cacheKey)
      if (cached) {
        return cached
      }

      const stock = await this.stockRepository.findById(input.id)

      if (!stock) {
        throw new NotFoundError(`Stock not found for id ${input.id}`)
      }

      const output: Output = {
        id: stock.id,
        productId: stock.productId,
        location: stock.location,
        quantity: stock.quantity,
        minQuantity: stock.minQuantity,
        isActive: stock.isActive,
        createdAt: stock.createdAt,
        updatedAt: stock.updatedAt,
      }

      await this.cache.set(cacheKey, output, CacheTtl.stock)
      return output
    }
  }
}
