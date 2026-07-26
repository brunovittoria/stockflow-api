import { UseCase as UseCaseInterface } from '@/shared/application/usecases/use-case'
import { SupplierRepository } from '@/suppliers/domain/repositories/supplier.repository'
import { NotFoundError } from '@/shared/domain/errors/not-found-error'

/**
 * GetSupplierUseCase
 *
 * Obtém os dados completos de um fornecedor pelo seu ID.
 *
 * Regras de negócio aplicadas:
 *  - Lança NotFoundError se o fornecedor não for encontrado
 *
 * Fluxo:
 *  1. Busca o fornecedor pelo ID no repositório
 *  2. Lança NotFoundError se não existir
 *  3. Retorna os dados completos do fornecedor
 */

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace GetSupplierUseCase {
  export interface Input {
    id: string
  }

  export interface Output {
    id: string
    name: string
    email: string
    phone: string
    cnpj: string
    isActive: boolean
    createdAt: Date
    updatedAt: Date
  }

  export class UseCase implements UseCaseInterface<Input, Output> {
    constructor(private supplierRepository: SupplierRepository) {}

    async execute(input: Input): Promise<Output> {
      const supplier = await this.supplierRepository.findById(input.id)

      if (!supplier) {
        throw new NotFoundError(`Supplier not found for id ${input.id}`)
      }

      return {
        id: supplier.id,
        name: supplier.name,
        email: supplier.email,
        phone: supplier.phone,
        cnpj: supplier.cnpj,
        isActive: supplier.isActive,
        createdAt: supplier.createdAt,
        updatedAt: supplier.updatedAt,
      }
    }
  }
}
