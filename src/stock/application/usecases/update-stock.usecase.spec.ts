import { UpdateStockUseCase } from '@/stock/application/usecases/update-stock.usecase'
import { StockInMemoryRepository } from '@/stock/infrastructure/database/in-memory/stock-in-memory.repository'
import { StockDataBuilder } from '@/stock/domain/testing/helpers/stock-data-builder'
import { StockEntity } from '@/stock/domain/entities/stock.entity'
import { NotFoundError } from '@/shared/domain/errors/not-found-error'
import { InMemoryCacheProvider } from '@/shared/infrastructure/cache/in-memory-cache.provider'

describe('UpdateStockUseCase', () => {
  let sut: UpdateStockUseCase.UseCase
  let repository: StockInMemoryRepository

  beforeEach(() => {
    repository = new StockInMemoryRepository()
    sut = new UpdateStockUseCase.UseCase(
      repository,
      new InMemoryCacheProvider(),
    )
  })

  it('should update all editable fields of a stock', async () => {
    const entity = new StockEntity(StockDataBuilder({ quantity: 10, minQuantity: 5 }))
    await repository.insert(entity)

    const output = await sut.execute({
      id: entity.id,
      location: 'Galpão B - Prateleira 2',
      quantity: 50,
      minQuantity: 10,
      isActive: true,
    })

    expect(output.id).toBe(entity.id)
    expect(output.location).toBe('Galpão B - Prateleira 2')
    expect(output.quantity).toBe(50)
    expect(output.minQuantity).toBe(10)
    expect(output.isActive).toBe(true)
  })

  it('should not change productId after update', async () => {
    const entity = new StockEntity(StockDataBuilder({}))
    await repository.insert(entity)

    const output = await sut.execute({
      id: entity.id,
      location: 'New Location',
      quantity: 20,
      minQuantity: 5,
      isActive: true,
    })

    expect(output.productId).toBe(entity.productId)
  })

  it('should deactivate stock when isActive is false', async () => {
    const entity = new StockEntity(StockDataBuilder({ isActive: true }))
    await repository.insert(entity)

    const output = await sut.execute({
      id: entity.id,
      location: entity.location,
      quantity: entity.quantity,
      minQuantity: entity.minQuantity,
      isActive: false,
    })

    expect(output.isActive).toBe(false)
  })

  it('should update updatedAt after update', async () => {
    const entity = new StockEntity(StockDataBuilder({}))
    const originalUpdatedAt = entity.updatedAt
    await repository.insert(entity)

    const output = await sut.execute({
      id: entity.id,
      location: 'New Location',
      quantity: 20,
      minQuantity: 5,
      isActive: true,
    })

    expect(output.updatedAt.getTime()).toBeGreaterThanOrEqual(
      originalUpdatedAt.getTime(),
    )
  })

  it('should throw NotFoundError when stock does not exist', async () => {
    await expect(
      sut.execute({
        id: 'non-existent-id',
        location: 'Loc',
        quantity: 10,
        minQuantity: 5,
        isActive: true,
      }),
    ).rejects.toThrow(NotFoundError)
  })

  it('should throw when quantity is negative', async () => {
    const entity = new StockEntity(StockDataBuilder({}))
    await repository.insert(entity)

    await expect(
      sut.execute({
        id: entity.id,
        location: entity.location,
        quantity: -1,
        minQuantity: 5,
        isActive: true,
      }),
    ).rejects.toThrow('Quantity cannot be negative')
  })
})
