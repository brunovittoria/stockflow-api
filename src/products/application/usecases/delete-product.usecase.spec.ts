import { DeleteProductUseCase } from '@/products/application/usecases/delete-product.usecase'
import { ProductInMemoryRepository } from '@/products/infrastructure/database/in-memory/product-in-memory.repository'
import { ProductDataBuilder } from '@/products/domain/testing/helpers/product-data-builder'
import { ProductEntity } from '@/products/domain/entities/product.entity'
import { NotFoundError } from '@/shared/domain/errors/not-found-error'
import { InMemoryCacheProvider } from '@/shared/infrastructure/cache/in-memory-cache.provider'

describe('DeleteProductUseCase', () => {
  let sut: DeleteProductUseCase.UseCase
  let repository: ProductInMemoryRepository

  beforeEach(() => {
    repository = new ProductInMemoryRepository()
    sut = new DeleteProductUseCase.UseCase(
      repository,
      new InMemoryCacheProvider(),
    )
  })

  it('should delete a product and return its id', async () => {
    const entity = new ProductEntity(ProductDataBuilder({}))
    await repository.insert(entity)

    const output = await sut.execute({ id: entity.id })

    expect(output.id).toBe(entity.id)
    expect(repository.items).toHaveLength(0)
  })

  it('should throw NotFoundError when product does not exist', async () => {
    await expect(sut.execute({ id: 'non-existent-id' })).rejects.toThrow(
      NotFoundError,
    )
  })

  it('should only delete the target product, keeping others intact', async () => {
    const entityA = new ProductEntity(ProductDataBuilder({}))
    const entityB = new ProductEntity(ProductDataBuilder({}))
    await repository.insert(entityA)
    await repository.insert(entityB)

    await sut.execute({ id: entityA.id })

    expect(repository.items).toHaveLength(1)
    expect(repository.items[0].id).toBe(entityB.id)
  })
})
