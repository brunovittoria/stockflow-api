import { GetProductUseCase } from '@/products/application/usecases/get-product.usecase'
import { ProductInMemoryRepository } from '@/products/infrastructure/database/in-memory/product-in-memory.repository'
import { NotFoundError } from '@/shared/domain/errors/not-found-error'
import { ProductDataBuilder } from '@/products/domain/testing/helpers/product-data-builder'
import { ProductEntity } from '@/products/domain/entities/product.entity'

describe('GetProductUseCase', () => {
  let sut: GetProductUseCase.UseCase
  let repository: ProductInMemoryRepository

  beforeEach(() => {
    repository = new ProductInMemoryRepository()
    sut = new GetProductUseCase.UseCase(repository)
  })

  it('should return a product by id', async () => {
    const entity = new ProductEntity(ProductDataBuilder({}))
    await repository.insert(entity)

    const output = await sut.execute({ id: entity.id })

    expect(output.id).toBe(entity.id)
    expect(output.name).toBe(entity.name)
    expect(output.description).toBe(entity.description)
    expect(output.sku).toBe(entity.sku)
    expect(output.price).toBe(entity.price)
    expect(output.costPrice).toBe(entity.costPrice)
    expect(output.category).toBe(entity.category)
    expect(output.supplierId).toBe(entity.supplierId)
    expect(output.isActive).toBe(entity.isActive)
    expect(output.createdAt).toEqual(entity.createdAt)
    expect(output.updatedAt).toEqual(entity.updatedAt)
  })

  it('should throw NotFoundError when product does not exist', async () => {
    await expect(sut.execute({ id: 'non-existent-id' })).rejects.toThrow(
      NotFoundError,
    )
  })
})
