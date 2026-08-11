import { UseCase as UseCaseInterface } from '@/shared/application/usecases/use-case'
import { ProductEntity } from '@/products/domain/entities/product.entity'
import { ProductRepository } from '@/products/domain/repositories/product.repository'
import { StockRepository } from '@/stock/domain/repositories/stock.repository'
import { StockEntity } from '@/stock/domain/entities/stock.entity'
import { ConflictError } from '@/shared/domain/errors/conflict-error'

/**
 * CreateProductUseCase
 *
 * Registra um novo produto no sistema e inicializa automaticamente
 * o seu estoque com quantity = 0.
 *
 * Regras de negócio aplicadas:
 *  - SKU deve ser único (lança ConflictError se já existir)
 *  - Preço de venda deve ser maior que o preço de custo
 *  - O estoque inicial é criado com quantity = 0 para garantir que
 *    o produto já esteja rastreável antes de qualquer entrega
 *
 * Fluxo:
 *  1. Verifica se o SKU já está em uso
 *  2. Valida a margem de lucro (price > costPrice)
 *  3. Cria a entidade produto com isActive = true por padrão
 *  4. Persiste o produto via repositório
 *  5. Cria o estoque inicial (quantity = 0) vinculado ao produto
 *  6. Persiste o estoque via repositório
 *  7. Retorna os dados do produto criado
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
    location: string
    minQuantity: number
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
      private stockRepository: StockRepository,
    ) {}

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

      // Cria a entidade produto (validações do domínio rodam aqui)
      const product = new ProductEntity({ ...input, isActive: true })

      // Persiste o produto
      await this.productRepository.insert(product)

      // Cria o estoque inicial vinculado ao produto (quantity sempre começa em 0)
      const stock = new StockEntity({
        productId: product.id,
        quantity: 0,
        minQuantity: input.minQuantity,
        location: input.location,
        isActive: true,
      })

      // Persiste o estoque
      await this.stockRepository.insert(stock)

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
