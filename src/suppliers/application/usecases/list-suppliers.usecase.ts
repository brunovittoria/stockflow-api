import { UseCase as UseCaseInterface } from '@/shared/application/usecases/use-case'
import { SupplierRepository } from '@/suppliers/domain/repositories/supplier.repository'
import {
  SearchParams,
  SearchResult,
} from '@/shared/domain/repositories/repository-contracts'
import { SupplierEntity } from '@/suppliers/domain/entities/supplier.entity'

/**
 * ListSuppliersUseCase
 *
 * Lista todos os fornecedores com suporte a filtro por nome, ordenação e paginação.
 *
 * Fluxo:
 *  1. Recebe os parâmetros de busca (filter, sort, sortDir, page, perPage)
 *  2. Delega ao repositório via search()
 *  3. Mapeia as entidades para objetos de output
 *  4. Retorna os itens junto com os metadados de paginação
 */

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace ListSuppliersUseCase {
  // Input reutiliza SearchParams: { page, perPage, sort, sortDir, filter }
  export type Input = SearchParams

  // Shape de cada fornecedor no output — objeto plano sem métodos da entidade
  export type SupplierOutput = {
    id: string
    name: string
    email: string
    phone: string
    cnpj: string
    isActive: boolean
    createdAt: Date
    updatedAt: Date
  }

  // Output herda os metadados de paginação do SearchResult (total, currentPage, perPage, lastPage)
  // e substitui 'items' por SupplierOutput[] em vez de SupplierEntity[]
  export type Output = Omit<SearchResult<SupplierOutput>, 'items'> & {
    items: SupplierOutput[]
  }

  export class UseCase implements UseCaseInterface<Input, Output> {
    // O repositório é injetado — o use case não sabe se é in-memory ou banco de dados
    constructor(private supplierRepository: SupplierRepository) {}

    async execute(input: Input): Promise<Output> {
      // Delega ao repositório: ele aplica filtro, ordenação e paginação internamente
      const result = await this.supplierRepository.search(input)

      return {
        // Mapeia cada SupplierEntity para um objeto plano via toOutput()
        items: result.items.map((entity) => this.toOutput(entity)),
        total: result.total,
        currentPage: result.currentPage,
        perPage: result.perPage,
        lastPage: result.lastPage,
      }
    }

    // Converte a entidade (com métodos e props internos) em um objeto simples para o output
    private toOutput(entity: SupplierEntity): SupplierOutput {
      return {
        id: entity.id,
        name: entity.name,
        email: entity.email,
        phone: entity.phone,
        cnpj: entity.cnpj,
        isActive: entity.isActive,
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt,
      }
    }
  }
}
