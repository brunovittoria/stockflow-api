import { CreateSupplierUseCase } from '@/suppliers/application/usecases/create-supplier.usecase'
import { SupplierInMemoryRepository } from '@/suppliers/infrastructure/database/in-memory/supplier-in-memory.repository'
import { SupplierDataBuilder } from '@/suppliers/domain/testing/helpers/supplier-data-builder'
import { ConflictError } from '@/shared/domain/errors/conflict-error'

describe('CreateSupplierUseCase', () => {
  let sut: CreateSupplierUseCase.UseCase
  let repository: SupplierInMemoryRepository

  beforeEach(() => {
    repository = new SupplierInMemoryRepository()
    sut = new CreateSupplierUseCase.UseCase(repository)
  })

  it('should create a supplier', async () => {
    const input = SupplierDataBuilder({})

    const output = await sut.execute(input)

    expect(output.id).toBeDefined()
    expect(output.name).toBe(input.name)
    expect(output.email).toBe(input.email)
    expect(output.phone).toBe(input.phone)
    expect(output.cnpj).toBe(input.cnpj)
    expect(output.isActive).toBe(true)
    expect(output.createdAt).toBeInstanceOf(Date)
    expect(output.updatedAt).toBeInstanceOf(Date)
    expect(repository.items).toHaveLength(1)
  })

  it('should throw ConflictError when CNPJ already exists', async () => {
    const input = SupplierDataBuilder({})

    await sut.execute(input)

    await expect(
      sut.execute({ ...input, name: 'Another Supplier' }),
    ).rejects.toThrow(ConflictError)
  })

  it('should allow two suppliers with different CNPJs', async () => {
    const inputA = SupplierDataBuilder({ cnpj: '11111111111111' })
    const inputB = SupplierDataBuilder({ cnpj: '22222222222222' })

    await sut.execute(inputA)
    await sut.execute(inputB)

    expect(repository.items).toHaveLength(2)
  })
})
