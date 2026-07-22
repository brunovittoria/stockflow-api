import { CreateProductUseCase } from '@/products/application/usecases/create-product.usecase'
import { ProductInMemoryRepository } from '@/products/infrastructure/database/in-memory/product-in-memory.repository'
import { ConflictError } from '@/shared/domain/errors/conflict-error'
import { ProductDataBuilder } from '@/products/domain/testing/helpers/product-data-builder'

describe('CreateProductUseCase', () => {
  let sut: CreateProductUseCase.UseCase
  let repository: ProductInMemoryRepository

  beforeEach(() => {
    repository = new ProductInMemoryRepository()
    sut = new CreateProductUseCase.UseCase(repository)
  })

  it('should create a product', async () => {
    const input = ProductDataBuilder({ sku: 'CAM-PT-M' })

    const output = await sut.execute(input)

    expect(output.id).toBeDefined()
    expect(output.sku).toBe('CAM-PT-M')
    expect(output.isActive).toBe(true)
    expect(repository.items).toHaveLength(1)
  })

  it('should throw when sku already exists', async () => {
    const input = ProductDataBuilder({ sku: 'SAME-SKU' })

    await sut.execute(input)

    await expect(sut.execute({ ...input, name: 'Product B' })).rejects.toThrow(
      ConflictError,
    )
  })

  it('should throw when price is less than cost', async () => {
    const input = ProductDataBuilder({ price: 1000, costPrice: 2000 })

    await expect(sut.execute(input)).rejects.toThrow(
      'Price must be greater than cost price',
    )
  })
})
