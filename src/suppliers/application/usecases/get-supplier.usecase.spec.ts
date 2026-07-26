import { GetSupplierUseCase } from '@/suppliers/application/usecases/get-supplier.usecase'
import { SupplierInMemoryRepository } from '@/suppliers/infrastructure/database/in-memory/supplier-in-memory.repository'
import { SupplierDataBuilder } from '@/suppliers/domain/testing/helpers/supplier-data-builder'
import { SupplierEntity } from '@/suppliers/domain/entities/supplier.entity'
import { NotFoundError } from '@/shared/domain/errors/not-found-error'

describe('GetSupplierUseCase', () => {
  let sut: GetSupplierUseCase.UseCase
  let repository: SupplierInMemoryRepository

  beforeEach(() => {
    repository = new SupplierInMemoryRepository()
    sut = new GetSupplierUseCase.UseCase(repository)
  })

  it('should return a supplier by id', async () => {
    const entity = new SupplierEntity(SupplierDataBuilder({}))
    await repository.insert(entity)

    const output = await sut.execute({ id: entity.id })

    expect(output.id).toBe(entity.id)
    expect(output.name).toBe(entity.name)
    expect(output.email).toBe(entity.email)
    expect(output.phone).toBe(entity.phone)
    expect(output.cnpj).toBe(entity.cnpj)
    expect(output.isActive).toBe(entity.isActive)
    expect(output.createdAt).toEqual(entity.createdAt)
    expect(output.updatedAt).toEqual(entity.updatedAt)
  })

  it('should throw NotFoundError when supplier does not exist', async () => {
    await expect(sut.execute({ id: 'non-existent-id' })).rejects.toThrow(
      NotFoundError,
    )
  })
})
