import { GetStockUseCase } from '@/stock/application/usecases/get-stock.usecase'
import { StockInMemoryRepository } from '@/stock/infrastructure/database/in-memory/stock-in-memory.repository'
import { StockDataBuilder } from '@/stock/domain/testing/helpers/stock-data-builder'
import { StockEntity } from '@/stock/domain/entities/stock.entity'
import { NotFoundError } from '@/shared/domain/errors/not-found-error'
import { InMemoryCacheProvider } from '@/shared/infrastructure/cache/in-memory-cache.provider'

describe('GetStockUseCase', () => {
  let sut: GetStockUseCase.UseCase
  let repository: StockInMemoryRepository
  let cache: InMemoryCacheProvider

  beforeEach(() => {
    repository = new StockInMemoryRepository()
    cache = new InMemoryCacheProvider()
    sut = new GetStockUseCase.UseCase(repository, cache)
  })

  it('should return a stock by id', async () => {
    const entity = new StockEntity(StockDataBuilder({}))
    await repository.insert(entity)

    const output = await sut.execute({ id: entity.id })

    expect(output.id).toBe(entity.id)
    expect(output.productId).toBe(entity.productId)
    expect(output.location).toBe(entity.location)
    expect(output.quantity).toBe(entity.quantity)
    expect(output.minQuantity).toBe(entity.minQuantity)
    expect(output.isActive).toBe(entity.isActive)
    expect(output.createdAt).toEqual(entity.createdAt)
    expect(output.updatedAt).toEqual(entity.updatedAt)
  })

  it('should throw NotFoundError when stock does not exist', async () => {
    await expect(sut.execute({ id: 'non-existent-id' })).rejects.toThrow(
      NotFoundError,
    )
  })

  it('should not call the repository on the second execute (cache hit)', async () => {
    const entity = new StockEntity(StockDataBuilder({}))
    await repository.insert(entity)
    const findByIdSpy = jest.spyOn(repository, 'findById')

    await sut.execute({ id: entity.id })
    await sut.execute({ id: entity.id })

    expect(findByIdSpy).toHaveBeenCalledTimes(1)
  })
})
