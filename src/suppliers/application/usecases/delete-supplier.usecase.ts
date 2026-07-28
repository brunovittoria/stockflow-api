import { UseCase as UseCaseInterface } from '@/shared/application/usecases/use-case'
import { SupplierRepository } from '@/suppliers/domain/repositories/supplier.repository'
import { NotFoundError } from '@/shared/domain/errors'

/**
 * DeleteSupplierUseCase
 *
 * Deleta um fornecedor existente.
 *
 * Regras de negócio aplicadas:
 *  - Lança NotFoundError se o fornecedor não for encontrado
 *
 * Fluxo:
 *  1. Busca o fornecedor pelo ID no repositório
 *  2. Lança NotFoundError se não existir
 *  3. Deleta o fornecedor via repositório
 *  4. Retorna os dados do fornecedor deletado
 */

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace DeleteSupplierUseCase {
  export interface Input {
    id: string
  }

  export interface Output {
    id: string
  }

  export class UseCase implements UseCaseInterface<Input, Output> {
    constructor(private supplierRepository: SupplierRepository) {}

    async execute(input: Input): Promise<Output> {
      const supplier = await this.supplierRepository.findById(input.id)

      if (!supplier) {
        throw new NotFoundError(`Supplier not found for id ${input.id}`)
      }

      await this.supplierRepository.delete(supplier.id)

      return { id: supplier.id }
    }
  }
}
