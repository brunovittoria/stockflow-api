import { ListCriticalStockUseCase } from '@/stock/application/usecases/list-critical-stock.usecase'
import { StockInMemoryRepository } from '@/stock/infrastructure/database/in-memory/stock-in-memory.repository'
import { StockDataBuilder } from '@/stock/domain/testing/helpers/stock-data-builder'
import { StockEntity } from '@/stock/domain/entities/stock.entity'

describe('ListCriticalStockUseCase', () => {
  let sut: ListCriticalStockUseCase.UseCase
  let repository: StockInMemoryRepository

  beforeEach(() => {
    repository = new StockInMemoryRepository()
    sut = new ListCriticalStockUseCase.UseCase(repository)
  })

  it('should return empty list when no critical stocks exist', async () => {
    await repository.insert(
      new StockEntity(StockDataBuilder({ quantity: 10, minQuantity: 5 })),
    )

    const output = await sut.execute({})

    expect(output.items).toHaveLength(0)
    expect(output.total).toBe(0)
  })

  it('should return only critical stocks', async () => {
    // crítico: quantity < minQuantity
    await repository.insert(
      new StockEntity(StockDataBuilder({ quantity: 2, minQuantity: 10 })),
    )
    await repository.insert(
      new StockEntity(StockDataBuilder({ quantity: 1, minQuantity: 5 })),
    )
    // não crítico
    await repository.insert(
      new StockEntity(StockDataBuilder({ quantity: 20, minQuantity: 5 })),
    )

    const output = await sut.execute({})

    expect(output.items).toHaveLength(2)
    expect(output.total).toBe(2)
    expect(output.items.every((item) => item.isCritical)).toBe(true)
  })

  it('should return isCritical as true for all items', async () => {
    await repository.insert(
      new StockEntity(StockDataBuilder({ quantity: 0, minQuantity: 10 })),
    )

    const output = await sut.execute({})

    expect(output.items[0].isCritical).toBe(true)
    expect(output.items[0].quantity).toBeLessThan(output.items[0].minQuantity)
  })

  it('should return mapped output without entity methods', async () => {
    await repository.insert(
      new StockEntity(StockDataBuilder({ quantity: 1, minQuantity: 10 })),
    )

    const output = await sut.execute({})
    const item = output.items[0]

    expect(item).toHaveProperty('id')
    expect(item).toHaveProperty('productId')
    expect(item).toHaveProperty('quantity')
    expect(item).toHaveProperty('minQuantity')
    expect(item).toHaveProperty('location')
    expect(item).toHaveProperty('isCritical')
    expect(item).not.toHaveProperty('props')
    expect(item).not.toHaveProperty('addQuantity')
  })
})
