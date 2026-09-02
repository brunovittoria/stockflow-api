import { UseCase as UseCaseInterface } from '@/shared/application/usecases/use-case'
import { ProductRepository } from '@/products/domain/repositories/product.repository'
import { NotFoundError } from '@/shared/domain/errors/not-found-error'
import { CacheProvider } from '@/shared/application/cache/cache-provider'
import { CacheKeys, CacheTtl } from '@/shared/application/cache/cache-keys'

/**
 * GetProductUseCase
 *
 * Obtém os dados completos de um produto pelo seu ID.
 *
 * Regras de negócio aplicadas:
 *  - Lança NotFoundError se o produto não for encontrado
 *  - 404 não é gravado no cache
 *
 * Fluxo:
 *  1. Tenta ler product:{id} no cache
 *  2. Hit → devolve o valor em cache (não consulta o repositório)
 *  3. Miss → busca o produto pelo ID no repositório
 *  4. Lança NotFoundError se não existir
 *  5. Grava no cache com TTL e retorna os dados completos
 */

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace GetProductUseCase {
  export interface Input {
    id: string
  }

  export interface Output {
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

  export class UseCase implements UseCaseInterface<Input, Output> {
    constructor(
      private productRepository: ProductRepository,
      private cache: CacheProvider,
    ) {}

    async execute(input: Input): Promise<Output> {
      const cacheKey = CacheKeys.product(input.id)
      const cached = await this.cache.get<Output>(cacheKey)
      if (cached) {
        return cached
      }

      const product = await this.productRepository.findById(input.id)

      if (!product) {
        throw new NotFoundError(`Product not found for id ${input.id}`)
      }

      const output: Output = {
        id: product.id,
        name: product.name,
        description: product.description,
        sku: product.sku,
        price: product.price,
        costPrice: product.costPrice,
        category: product.category,
        supplierId: product.supplierId,
        isActive: product.isActive,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      }

      await this.cache.set(cacheKey, output, CacheTtl.product)
      return output
    }
  }
}
