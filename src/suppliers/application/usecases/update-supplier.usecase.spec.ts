import { UpdateSupplierUseCase } from '@/suppliers/application/usecases/update-supplier.usecase'
import { SupplierInMemoryRepository } from '@/suppliers/infrastructure/database/in-memory/supplier-in-memory.repository'
import { SupplierDataBuilder } from '@/suppliers/domain/testing/helpers/supplier-data-builder'
import { SupplierEntity } from '@/suppliers/domain/entities/supplier.entity'
import { NotFoundError } from '@/shared/domain/errors/not-found-error'

describe('UpdateSupplierUseCase', () => {
  let sut: UpdateSupplierUseCase.UseCase
  let repository: SupplierInMemoryRepository

  beforeEach(() => {
    repository = new SupplierInMemoryRepository()
    sut = new UpdateSupplierUseCase.UseCase(repository)
  })

  it('should update all editable fields of a supplier', async () => {
    const entity = new SupplierEntity(SupplierDataBuilder({}))
    await repository.insert(entity)

    const output = await sut.execute({
      id: entity.id,
      name: 'Updated Name',
      email: 'updated@email.com',
      phone: '11999999999',
    })

    expect(output.id).toBe(entity.id)
    expect(output.name).toBe('Updated Name')
    expect(output.email).toBe('updated@email.com')
    expect(output.phone).toBe('11999999999')
  })

  it('should not change cnpj after update', async () => {
    const entity = new SupplierEntity(SupplierDataBuilder({}))
    await repository.insert(entity)

    const output = await sut.execute({
      id: entity.id,
      name: 'New Name',
      email: 'new@email.com',
      phone: '11988888888',
    })

    expect(output.cnpj).toBe(entity.cnpj)
  })

  it('should update updatedAt after update', async () => {
    const entity = new SupplierEntity(SupplierDataBuilder({}))
    const originalUpdatedAt = entity.updatedAt
    await repository.insert(entity)

    const output = await sut.execute({
      id: entity.id,
      name: 'New Name',
      email: 'new@email.com',
      phone: '11988888888',
    })

    expect(output.updatedAt.getTime()).toBeGreaterThanOrEqual(
      originalUpdatedAt.getTime(),
    )
  })

  it('should throw NotFoundError when supplier does not exist', async () => {
    await expect(
      sut.execute({
        id: 'non-existent-id',
        name: 'Name',
        email: 'email@test.com',
        phone: '11999999999',
      }),
    ).rejects.toThrow(NotFoundError)
  })
})
