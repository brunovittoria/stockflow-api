import { UseCase as UseCaseInterface } from '@/shared/application/usecases/use-case'
import { ProductRepository } from '@/products/domain/repositories/product.repository'
import { ProductEntity } from '@/products/domain/entities/product.entity'
import { NotFoundError } from '@/shared/domain/errors'

/**
 * UpdateProductUseCase
 *
 * Atualiza os dados editáveis de um produto existente.
 * SKU e supplierId são imutáveis e não podem ser alterados.
 *
 * Regras de negócio aplicadas:
 *  - Lança NotFoundError se o produto não for encontrado
 *  - Preço de venda deve ser maior que o preço de custo (validado pela entidade)
 *
 * Fluxo:
 *  1. Busca o produto pelo ID no repositório
 *  2. Lança NotFoundError se não existir
 *  3. Chama os métodos de atualização da entidade (validações do domínio rodam aqui)
 *  4. Persiste via repositório
 *  5. Retorna os dados do produto atualizado
 */

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace UpdateProductUseCase {
  export interface Input {
    id: string
    name: string
    description: string
    price: number
    costPrice: number
    category: string
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
      const product: ProductEntity = await this.productRepository.findById(
        input.id,
      )

      if (!product) {
        throw new NotFoundError(`Product not found for id ${input.id}`)
      }

      product.updateName(input.name)
      product.updateDescription(input.description)
      product.updateCostPrice(input.costPrice)
      product.updatePrice(input.price)
      product.updateCategory(input.category)

      await this.productRepository.update(product)

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
