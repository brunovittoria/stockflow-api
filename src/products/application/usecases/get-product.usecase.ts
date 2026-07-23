import { UseCase as UseCaseInterface } from '@/shared/application/usecases/use-case'
import { ProductRepository } from '@/products/domain/repositories/product.repository'
import { NotFoundError } from '@/shared/domain/errors/not-found-error'

/**
 * GetProductUseCase
 *
 * Obtém os dados completos de um produto pelo seu ID.
 *
 * Regras de negócio aplicadas:
 *  - Lança NotFoundError se o produto não for encontrado
 *
 * Fluxo:
 *  1. Busca o produto pelo ID no repositório
 *  2. Lança NotFoundError se não existir
 *  3. Retorna os dados completos do produto
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
    constructor(private productRepository: ProductRepository) {}

    async execute(input: Input): Promise<Output> {
      const product = await this.productRepository.findById(input.id)

      if (!product) {
        throw new NotFoundError(`Product not found for id ${input.id}`)
      }

      return {
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
    }
  }
}
