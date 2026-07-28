import { UseCase as UseCaseInterface } from '@/shared/application/usecases/use-case'
import { SupplierRepository } from '@/suppliers/domain/repositories/supplier.repository'
import { NotFoundError } from '@/shared/domain/errors'

/**
 * UpdateSupplierUseCase
 *
 * Atualiza os dados editáveis de um fornecedor existente.
 *
 * Regras de negócio aplicadas:
 *  - Lança NotFoundError se o fornecedor não for encontrado
 *  - Email deve ser válido (validado pela entidade)
 *  - Telefone deve ser válido (validado pela entidade)
 *
 * Fluxo:
 *  1. Busca o fornecedor pelo ID no repositório
 *  2. Lança NotFoundError se não existir
 *  3. Chama os métodos de atualização da entidade (validações do domínio rodam aqui)
 *  4. Persiste via repositório
 *  5. Retorna os dados do fornecedor atualizado
 */

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace UpdateSupplierUseCase {
  export interface Input {
    id: string
    name: string
    email: string
    phone: string
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

      supplier.updateName(input.name)
      supplier.updateEmail(input.email)
      supplier.updatePhone(input.phone)

      await this.supplierRepository.update(supplier)

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
