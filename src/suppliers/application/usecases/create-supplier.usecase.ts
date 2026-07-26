import { UseCase as UseCaseInterface } from '@/shared/application/usecases/use-case'
import { SupplierRepository } from '@/suppliers/domain/repositories/supplier.repository'
import { SupplierEntity } from '@/suppliers/domain/entities/supplier.entity'
import { ConflictError } from '@/shared/domain/errors/conflict-error'

/**
 * CreateSupplierUseCase
 *
 * Registra um novo fornecedor no sistema.
 *
 * Regras de negócio aplicadas:
 *  - Nome deve ser único
 *  - Email deve ser único
 *  - Telefone deve ser único
 *  - CNPJ deve ser único
 *
 * Fluxo:
 *  1. Verifica se o CNPJ já está em uso
 *  2. Cria a entidade com isActive = true por padrão
 *  3. Persiste via repositório
 *  4. Retorna os dados do fornecedor criado
 */

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace CreateSupplierUseCase {
  export interface Input {
    name: string
    email: string
    phone: string
    cnpj: string
  }

  export interface Output {
    id: string
    name: string
    email: string
    phone: string
    cnpj: string
    isActive: boolean
    createdAt: Date
  }

  export class UseCase implements UseCaseInterface<Input, Output> {
    constructor(private supplierRepository: SupplierRepository) {}

    async execute(input: Input): Promise<Output> {
      const cnpjExists = await this.supplierRepository.findByCnpj(input.cnpj)

      if (cnpjExists.length > 0) {
        throw new ConflictError(
          `Supplier with CNPJ ${input.cnpj} already exists`,
        )
      }

      const supplier = new SupplierEntity({ ...input, isActive: true })

      await this.supplierRepository.insert(supplier)

      return {
        id: supplier.id,
        name: supplier.name,
        email: supplier.email,
        phone: supplier.phone,
        cnpj: supplier.cnpj,
        isActive: supplier.isActive,
        createdAt: supplier.createdAt,
      }
    }
  }
}
