import { UpdateProductUseCase } from '@/products/application/usecases/update-product.usecase'
import { ProductInMemoryRepository } from '@/products/infrastructure/database/in-memory/product-in-memory.repository'
import { ProductDataBuilder } from '@/products/domain/testing/helpers/product-data-builder'
import { ProductEntity } from '@/products/domain/entities/product.entity'
import { NotFoundError } from '@/shared/domain/errors/not-found-error'
import { InMemoryCacheProvider } from '@/shared/infrastructure/cache/in-memory-cache.provider'

describe('UpdateProductUseCase', () => {
  let sut: UpdateProductUseCase.UseCase
  let repository: ProductInMemoryRepository

  beforeEach(() => {
    repository = new ProductInMemoryRepository()
    sut = new UpdateProductUseCase.UseCase(
      repository,
      new InMemoryCacheProvider(),
    )
  })

  it('should update all editable fields of a product', async () => {
    const entity = new ProductEntity(
      ProductDataBuilder({ price: 5000, costPrice: 2000 }),
    )
    await repository.insert(entity)

    const output = await sut.execute({
      id: entity.id,
      name: 'Updated Name',
      description: 'Updated description',
      price: 8000,
      costPrice: 3000,
      category: 'Updated Category',
    })

    expect(output.id).toBe(entity.id)
    expect(output.name).toBe('Updated Name')
    expect(output.description).toBe('Updated description')
    expect(output.price).toBe(8000)
    expect(output.costPrice).toBe(3000)
    expect(output.category).toBe('Updated Category')
  })

  it('should not change sku and supplierId', async () => {
    const entity = new ProductEntity(
      ProductDataBuilder({ price: 5000, costPrice: 2000 }),
    )
    await repository.insert(entity)

    const output = await sut.execute({
      id: entity.id,
      name: 'New Name',
      description: 'New desc',
      price: 6000,
      costPrice: 2500,
      category: 'New Category',
    })

    expect(output.sku).toBe(entity.sku)
    expect(output.supplierId).toBe(entity.supplierId)
  })

  it('should update updatedAt after update', async () => {
    const entity = new ProductEntity(
      ProductDataBuilder({ price: 5000, costPrice: 2000 }),
    )
    const originalUpdatedAt = entity.updatedAt
    await repository.insert(entity)

    const output = await sut.execute({
      id: entity.id,
      name: 'New Name',
      description: 'New desc',
      price: 6000,
      costPrice: 2500,
      category: 'New Category',
    })

    expect(output.updatedAt.getTime()).toBeGreaterThanOrEqual(
      originalUpdatedAt.getTime(),
    )
  })

  it('should throw NotFoundError when product does not exist', async () => {
    await expect(
      sut.execute({
        id: 'non-existent-id',
        name: 'Name',
        description: 'Desc',
        price: 5000,
        costPrice: 2000,
        category: 'Cat',
      }),
    ).rejects.toThrow(NotFoundError)
  })

  it('should throw when price is less than or equal to cost price', async () => {
    const entity = new ProductEntity(
      ProductDataBuilder({ price: 5000, costPrice: 2000 }),
    )
    await repository.insert(entity)

    await expect(
      sut.execute({
        id: entity.id,
        name: 'Name',
        description: 'Desc',
        price: 1000,
        costPrice: 2000,
        category: 'Cat',
      }),
    ).rejects.toThrow('Price must be greater than cost price')
  })
})
