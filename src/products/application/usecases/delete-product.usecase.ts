import { UseCase as UseCaseInterface } from '@/shared/application/usecases/use-case'
import { ProductRepository } from '@/products/domain/repositories/product.repository'
import { NotFoundError } from '@/shared/domain/errors'

/**
 * DeleteProductUseCase
 *
 * Deleta um produto existente.
 *
 * Regras de negócio aplicadas:
 *  - Lança NotFoundError se o produto não for encontrado
 *
 * Fluxo:
 *  1. Busca o produto pelo ID no repositório
 *  2. Lança NotFoundError se não existir
 *  3. Deleta o produto via repositório
 *  4. Retorna os dados do produto deletado
 */

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace DeleteProductUseCase {
  export interface Input {
    id: string
  }

  export interface Output {
    id: string
  }

  export class UseCase implements UseCaseInterface<Input, Output> {
    constructor(private productRepository: ProductRepository) {}

    async execute(input: Input): Promise<Output> {
      const product = await this.productRepository.findById(input.id)

      if (!product) {
        throw new NotFoundError(`Product not found for id ${input.id}`)
      }

      await this.productRepository.delete(input.id)

      return { id: product.id }
    }
  }
}
