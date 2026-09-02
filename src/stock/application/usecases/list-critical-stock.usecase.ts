import { UseCase as UseCaseInterface } from '@/shared/application/usecases/use-case'
import { StockRepository } from '@/stock/domain/repositories/stock.repository'
import { StockEntity } from '@/stock/domain/entities/stock.entity'
import { CacheProvider } from '@/shared/application/cache/cache-provider'
import { CacheKeys, CacheTtl } from '@/shared/application/cache/cache-keys'

/**
 * ListCriticalStockUseCase
 *
 * Lista todos os estoques cujo quantity < minQuantity (estoque crítico).
 *
 * Regras de negócio aplicadas:
 *  - Estoque crítico é aquele onde quantity < minQuantity
 *
 * Fluxo:
 *  1. Tenta ler stocks:critical no cache
 *  2. Hit → devolve
 *  3. Miss → findBelowMinQuantity(), mapeia, grava com TTL curto, retorna
 */

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace ListCriticalStockUseCase {
  export type Input = Record<string, never>

  export type StockOutput = {
    id: string
    productId: string
    quantity: number
    minQuantity: number
    location: string
    isActive: boolean
    isCritical: boolean
    createdAt: Date
    updatedAt: Date
  }

  export interface Output {
    items: StockOutput[]
    total: number
  }

  export class UseCase implements UseCaseInterface<Input, Output> {
    constructor(
      private stockRepository: StockRepository,
      private cache: CacheProvider,
    ) {}

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async execute(_input: Input): Promise<Output> {
      const cacheKey = CacheKeys.stocksCritical()
      const cached = await this.cache.get<Output>(cacheKey)
      if (cached) {
        return cached
      }

      const items = await this.stockRepository.findBelowMinQuantity()

      const output: Output = {
        items: items.map((entity) => this.toOutput(entity)),
        total: items.length,
      }

      await this.cache.set(cacheKey, output, CacheTtl.stocksCritical)
      return output
    }

    private toOutput(entity: StockEntity): StockOutput {
      return {
        id: entity.id,
        productId: entity.productId,
        quantity: entity.quantity,
        minQuantity: entity.minQuantity,
        location: entity.location,
        isActive: entity.isActive,
        isCritical: entity.isCritical,
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt,
      }
    }
  }
}
