import { UseCase as UseCaseInterface } from '@/shared/application/usecases/use-case'
import { ProductEntity } from '@/products/domain/entities/product.entity'
import { ProductRepository } from '@/products/domain/repositories/product.repository'
import { ConflictError } from '@/shared/domain/errors/conflict-error'

/**
 * CreateProductUseCase
 *
 * Registra um novo produto no sistema.
 *
 * Regras de negócio aplicadas:
 *  - SKU deve ser único (lança ConflictError se já existir)
 *  - Preço de venda deve ser maior que o preço de custo
 *
 * Fluxo:
 *  1. Verifica se o SKU já está em uso
 *  2. Valida a margem de lucro (price > costPrice)
 *  3. Cria a entidade com isActive = true por padrão
 *  4. Persiste via repositório
 *  5. Retorna os dados do produto criado
 */

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace CreateProductUseCase {
  export interface Input {
    name: string
    description: string
    sku: string
    price: number
    costPrice: number
    category: string
    supplierId: string
  }

  export interface Output {
    id: string
    name: string
    sku: string
    price: number
    costPrice: number
    category: string
    supplierId: string
    isActive: boolean
    createdAt: Date
  }

  export class UseCase implements UseCaseInterface<Input, Output> {
    constructor(private productRepository: ProductRepository) {}

    async execute(input: Input): Promise<Output> {
      // Regra: SKU é único
      const skuExists = await this.productRepository.skuExists(input.sku)
      if (skuExists) {
        throw new ConflictError(`SKU ${input.sku} already exists`)
      }

      // Regra: preço de venda > preço de custo
      if (input.price <= input.costPrice) {
        throw new Error('Price must be greater than cost price')
      }

      // Cria a entidade (validações do domínio rodam aqui, caso falhe, a exceção é lançada)
      const entity = new ProductEntity({ ...input, isActive: true })

      // Persiste via repositório
      await this.productRepository.insert(entity)

      // Retorna o output mapeado
      return {
        id: entity.id,
        name: entity.name,
        sku: entity.sku,
        price: entity.price,
        costPrice: entity.costPrice,
        category: entity.category,
        supplierId: entity.supplierId,
        isActive: entity.isActive,
        createdAt: entity.createdAt,
      }
    }
  }
}
