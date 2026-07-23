import { UseCase as UseCaseInterface } from '@/shared/application/usecases/use-case'
import { ProductRepository } from '@/products/domain/repositories/product.repository'
import {
  SearchParams,
  SearchResult,
} from '@/shared/domain/repositories/repository-contracts'
import { ProductEntity } from '@/products/domain/entities/product.entity'

/**
 * ListProductsUseCase
 *
 * Lista produtos com suporte a filtro por nome, ordenação e paginação.
 *
 * Fluxo:
 *  1. Recebe os parâmetros de busca (filter, sort, sortDir, page, perPage)
 *  2. Delega ao repositório via search()
 *  3. Mapeia as entidades para objetos de output
 *  4. Retorna os itens junto com os metadados de paginação
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
    constructor(private productRepository: ProductRepository) {}

    async execute(input: Input): Promise<Output> {
      const result = await this.productRepository.search(input)

      return {
        items: result.items.map((entity) => this.toOutput(entity)),
        total: result.total,
        currentPage: result.currentPage,
        perPage: result.perPage,
        lastPage: result.lastPage,
      }
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
