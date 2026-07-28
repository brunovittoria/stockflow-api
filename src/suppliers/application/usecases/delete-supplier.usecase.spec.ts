import { DeleteSupplierUseCase } from '@/suppliers/application/usecases/delete-supplier.usecase'
import { SupplierInMemoryRepository } from '@/suppliers/infrastructure/database/in-memory/supplier-in-memory.repository'
import { SupplierDataBuilder } from '@/suppliers/domain/testing/helpers/supplier-data-builder'
import { SupplierEntity } from '@/suppliers/domain/entities/supplier.entity'
import { NotFoundError } from '@/shared/domain/errors/not-found-error'

describe('DeleteSupplierUseCase', () => {
  let sut: DeleteSupplierUseCase.UseCase
  let repository: SupplierInMemoryRepository

  beforeEach(() => {
    repository = new SupplierInMemoryRepository()
    sut = new DeleteSupplierUseCase.UseCase(repository)
  })

  it('should delete a supplier and return its id', async () => {
    const entity = new SupplierEntity(SupplierDataBuilder({}))
    await repository.insert(entity)

    const output = await sut.execute({ id: entity.id })

    expect(output.id).toBe(entity.id)
    expect(repository.items).toHaveLength(0)
  })

  it('should throw NotFoundError when supplier does not exist', async () => {
    await expect(sut.execute({ id: 'non-existent-id' })).rejects.toThrow(
      NotFoundError,
    )
  })

  it('should only delete the target supplier, keeping others intact', async () => {
    const entityA = new SupplierEntity(SupplierDataBuilder({}))
    const entityB = new SupplierEntity(SupplierDataBuilder({}))
    await repository.insert(entityA)
    await repository.insert(entityB)

    await sut.execute({ id: entityA.id })

    expect(repository.items).toHaveLength(1)
    expect(repository.items[0].id).toBe(entityB.id)
  })
})
