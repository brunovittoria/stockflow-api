import { ListSuppliersUseCase } from '@/suppliers/application/usecases/list-suppliers.usecase'
import { SupplierInMemoryRepository } from '@/suppliers/infrastructure/database/in-memory/supplier-in-memory.repository'
import { SupplierDataBuilder } from '@/suppliers/domain/testing/helpers/supplier-data-builder'
import { SupplierEntity } from '@/suppliers/domain/entities/supplier.entity'

describe('ListSuppliersUseCase', () => {
  let sut: ListSuppliersUseCase.UseCase
  let repository: SupplierInMemoryRepository

  beforeEach(() => {
    repository = new SupplierInMemoryRepository()
    sut = new ListSuppliersUseCase.UseCase(repository)
  })

  it('should return empty list when no suppliers exist', async () => {
    const output = await sut.execute({})

    expect(output.items).toHaveLength(0)
    expect(output.total).toBe(0)
  })

  it('should return all suppliers with default pagination', async () => {
    for (let i = 0; i < 3; i++) {
      await repository.insert(new SupplierEntity(SupplierDataBuilder({})))
    }

    const output = await sut.execute({})

    expect(output.items).toHaveLength(3)
    expect(output.total).toBe(3)
    expect(output.currentPage).toBe(1)
    expect(output.perPage).toBe(15)
    expect(output.lastPage).toBe(1)
  })

  it('should filter suppliers by name', async () => {
    await repository.insert(
      new SupplierEntity(SupplierDataBuilder({ name: 'Fornecedor Alpha' })),
    )
    await repository.insert(
      new SupplierEntity(SupplierDataBuilder({ name: 'Distribuidora Beta' })),
    )
    await repository.insert(
      new SupplierEntity(SupplierDataBuilder({ name: 'Fornecedor Gamma' })),
    )

    const output = await sut.execute({ filter: 'fornecedor' })

    expect(output.items).toHaveLength(2)
    expect(output.total).toBe(2)
  })

  it('should sort suppliers by name ascending', async () => {
    await repository.insert(
      new SupplierEntity(SupplierDataBuilder({ name: 'Zeta Ltda' })),
    )
    await repository.insert(
      new SupplierEntity(SupplierDataBuilder({ name: 'Alpha Ltda' })),
    )
    await repository.insert(
      new SupplierEntity(SupplierDataBuilder({ name: 'Beta Ltda' })),
    )

    const output = await sut.execute({ sort: 'name', sortDir: 'asc' })

    expect(output.items[0].name).toBe('Alpha Ltda')
    expect(output.items[1].name).toBe('Beta Ltda')
    expect(output.items[2].name).toBe('Zeta Ltda')
  })

  it('should sort suppliers by name descending', async () => {
    await repository.insert(
      new SupplierEntity(SupplierDataBuilder({ name: 'Zeta Ltda' })),
    )
    await repository.insert(
      new SupplierEntity(SupplierDataBuilder({ name: 'Alpha Ltda' })),
    )
    await repository.insert(
      new SupplierEntity(SupplierDataBuilder({ name: 'Beta Ltda' })),
    )

    const output = await sut.execute({ sort: 'name', sortDir: 'desc' })

    expect(output.items[0].name).toBe('Zeta Ltda')
    expect(output.items[1].name).toBe('Beta Ltda')
    expect(output.items[2].name).toBe('Alpha Ltda')
  })

  it('should paginate suppliers correctly', async () => {
    for (let i = 0; i < 5; i++) {
      await repository.insert(new SupplierEntity(SupplierDataBuilder({})))
    }

    const page1 = await sut.execute({ page: 1, perPage: 2 })
    const page2 = await sut.execute({ page: 2, perPage: 2 })
    const page3 = await sut.execute({ page: 3, perPage: 2 })

    expect(page1.items).toHaveLength(2)
    expect(page2.items).toHaveLength(2)
    expect(page3.items).toHaveLength(1)
    expect(page1.total).toBe(5)
    expect(page1.lastPage).toBe(3)
  })

  it('should return mapped output without entity methods', async () => {
    const entity = new SupplierEntity(SupplierDataBuilder({}))
    await repository.insert(entity)

    const output = await sut.execute({})
    const item = output.items[0]

    expect(item.id).toBe(entity.id)
    expect(item.name).toBe(entity.name)
    expect(item).not.toHaveProperty('props')
    expect(item).not.toHaveProperty('updateName')
  })
})
