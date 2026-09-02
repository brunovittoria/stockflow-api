import { UseCase as UseCaseInterface } from '@/shared/application/usecases/use-case'
import { ProductRepository } from '@/products/domain/repositories/product.repository'
import {
  SearchParams,
  SearchResult,
} from '@/shared/domain/repositories/repository-contracts'
import { ProductEntity } from '@/products/domain/entities/product.entity'
import { CacheProvider } from '@/shared/application/cache/cache-provider'
import { CacheKeys, CacheTtl } from '@/shared/application/cache/cache-keys'

/**
 * ListProductsUseCase
 *
 * Lista produtos com suporte a filtro por nome, ordenação e paginação.
 *
 * Fluxo:
 *  1. Monta a chave products:list:{params}
 *  2. Hit no cache → devolve sem ir ao repositório
 *  3. Miss → search() no repositório
 *  4. Mapeia entidades para output, grava no cache (TTL curto) e retorna
 */

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace ListProductsUseCase {
  export type Input = SearchParams

  export type ProductOutput = {
    id: string
    name: string
    description: string
    sku: string
    price: number
    costPrice: number
    category: string
    supplierId: string
    isActive: boolean
    createdAt: Date
    updatedAt: Date
  }

  export type Output = Omit<SearchResult<ProductOutput>, 'items'> & {
    items: ProductOutput[]
  }

  export class UseCase implements UseCaseInterface<Input, Output> {
    constructor(
      private productRepository: ProductRepository,
      private cache: CacheProvider,
    ) {}

    async execute(input: Input): Promise<Output> {
      const cacheKey = CacheKeys.productsList(input)
      const cached = await this.cache.get<Output>(cacheKey)
      if (cached) {
        return cached
      }

      const result = await this.productRepository.search(input)

      const output: Output = {
        items: result.items.map((entity) => this.toOutput(entity)),
        total: result.total,
        currentPage: result.currentPage,
        perPage: result.perPage,
        lastPage: result.lastPage,
      }

      await this.cache.set(cacheKey, output, CacheTtl.productsList)
      return output
    }

    private toOutput(entity: ProductEntity): ProductOutput {
      return {
        id: entity.id,
        name: entity.name,
        description: entity.description,
        sku: entity.sku,
        price: entity.price,
        costPrice: entity.costPrice,
        category: entity.category,
        supplierId: entity.supplierId,
        isActive: entity.isActive,
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt,
      }
    }
  }
}
