import { ListProductsUseCase } from '@/products/application/usecases/list-products.usecase'
import { ProductInMemoryRepository } from '@/products/infrastructure/database/in-memory/product-in-memory.repository'
import { ProductDataBuilder } from '@/products/domain/testing/helpers/product-data-builder'
import { ProductEntity } from '@/products/domain/entities/product.entity'
import { InMemoryCacheProvider } from '@/shared/infrastructure/cache/in-memory-cache.provider'

describe('ListProductsUseCase', () => {
  let sut: ListProductsUseCase.UseCase
  let repository: ProductInMemoryRepository

  beforeEach(() => {
    repository = new ProductInMemoryRepository()
    sut = new ListProductsUseCase.UseCase(
      repository,
      new InMemoryCacheProvider(),
    )
  })

  it('should return empty list when no products exist', async () => {
    const output = await sut.execute({})

    expect(output.items).toHaveLength(0)
    expect(output.total).toBe(0)
  })

  it('should return all products with default pagination', async () => {
    for (let i = 0; i < 3; i++) {
      await repository.insert(new ProductEntity(ProductDataBuilder({})))
    }

    const output = await sut.execute({})

    expect(output.items).toHaveLength(3)
    expect(output.total).toBe(3)
    expect(output.currentPage).toBe(1)
    expect(output.perPage).toBe(15)
    expect(output.lastPage).toBe(1)
  })

  it('should filter products by name', async () => {
    await repository.insert(
      new ProductEntity(ProductDataBuilder({ name: 'Whey Protein' })),
    )
    await repository.insert(
      new ProductEntity(ProductDataBuilder({ name: 'Creatina' })),
    )
    await repository.insert(
      new ProductEntity(ProductDataBuilder({ name: 'Whey Isolado' })),
    )

    const output = await sut.execute({ filter: 'whey' })

    expect(output.items).toHaveLength(2)
    expect(output.total).toBe(2)
    expect(
      output.items.every((i) => i.name.toLowerCase().includes('whey')),
    ).toBe(true)
  })

  it('should sort products by name ascending', async () => {
    await repository.insert(
      new ProductEntity(ProductDataBuilder({ name: 'Creatina' })),
    )
    await repository.insert(
      new ProductEntity(ProductDataBuilder({ name: 'Albumina' })),
    )
    await repository.insert(
      new ProductEntity(ProductDataBuilder({ name: 'Whey Protein' })),
    )

    const output = await sut.execute({ sort: 'name', sortDir: 'asc' })

    expect(output.items[0].name).toBe('Albumina')
    expect(output.items[1].name).toBe('Creatina')
    expect(output.items[2].name).toBe('Whey Protein')
  })

  it('should sort products by name descending', async () => {
    await repository.insert(
      new ProductEntity(ProductDataBuilder({ name: 'Creatina' })),
    )
    await repository.insert(
      new ProductEntity(ProductDataBuilder({ name: 'Albumina' })),
    )
    await repository.insert(
      new ProductEntity(ProductDataBuilder({ name: 'Whey Protein' })),
    )

    const output = await sut.execute({ sort: 'name', sortDir: 'desc' })

    expect(output.items[0].name).toBe('Whey Protein')
    expect(output.items[1].name).toBe('Creatina')
    expect(output.items[2].name).toBe('Albumina')
  })

  it('should paginate products correctly', async () => {
    for (let i = 0; i < 5; i++) {
      await repository.insert(new ProductEntity(ProductDataBuilder({})))
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
    const entity = new ProductEntity(ProductDataBuilder({}))
    await repository.insert(entity)

    const output = await sut.execute({})
    const item = output.items[0]

    expect(item.id).toBe(entity.id)
    expect(item.name).toBe(entity.name)
    expect(item.description).toBe(entity.description)
    expect(item).not.toHaveProperty('props')
    expect(item).not.toHaveProperty('updateName')
  })
})
