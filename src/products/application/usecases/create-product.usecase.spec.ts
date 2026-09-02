import { CreateProductUseCase } from '@/products/application/usecases/create-product.usecase'
import { ProductInMemoryRepository } from '@/products/infrastructure/database/in-memory/product-in-memory.repository'
import { StockInMemoryRepository } from '@/stock/infrastructure/database/in-memory/stock-in-memory.repository'
import { ConflictError } from '@/shared/domain/errors/conflict-error'
import { ProductDataBuilder } from '@/products/domain/testing/helpers/product-data-builder'
import { InMemoryCacheProvider } from '@/shared/infrastructure/cache/in-memory-cache.provider'

// ProductDataBuilder retorna apenas campos de produto (ProductProps).
// location e minQuantity são campos de stock — sempre adicionados manualmente.
// Garante price > costPrice por padrão para evitar falhas aleatórias do faker
const buildInput = (
  overrides: Partial<CreateProductUseCase.Input> = {},
): CreateProductUseCase.Input => {
  const product = ProductDataBuilder({
    price: 10000,
    costPrice: 5000,
    ...overrides,
  })
  return {
    ...product,
    location: overrides.location ?? 'A1',
    minQuantity: overrides.minQuantity ?? 5,
  }
}

describe('CreateProductUseCase', () => {
  let sut: CreateProductUseCase.UseCase
  let productRepository: ProductInMemoryRepository
  let stockRepository: StockInMemoryRepository

  beforeEach(() => {
    productRepository = new ProductInMemoryRepository()
    stockRepository = new StockInMemoryRepository()
    sut = new CreateProductUseCase.UseCase(
      productRepository,
      stockRepository,
      new InMemoryCacheProvider(),
    )
  })

  it('should create a product', async () => {
    const output = await sut.execute(buildInput({ sku: 'CAM-PT-M' }))

    expect(output.id).toBeDefined()
    expect(output.sku).toBe('CAM-PT-M')
    expect(output.isActive).toBe(true)
    expect(productRepository.items).toHaveLength(1)
  })

  it('should automatically create a stock entry with quantity 0', async () => {
    const output = await sut.execute(
      buildInput({ sku: 'WEY-PT-1KG', location: 'B2', minQuantity: 10 }),
    )

    expect(stockRepository.items).toHaveLength(1)

    const stock = stockRepository.items[0]
    expect(stock.productId).toBe(output.id)
    expect(stock.quantity).toBe(0)
    expect(stock.minQuantity).toBe(10)
    expect(stock.location).toBe('B2')
    expect(stock.isActive).toBe(true)
  })

  it('should throw when sku already exists', async () => {
    const input = buildInput({ sku: 'SAME-SKU' })

    await sut.execute(input)

    await expect(sut.execute({ ...input, name: 'Product B' })).rejects.toThrow(
      ConflictError,
    )
  })

  it('should throw when price is less than cost', async () => {
    await expect(
      sut.execute(buildInput({ price: 1000, costPrice: 2000 })),
    ).rejects.toThrow('Price must be greater than cost price')
  })

  it('should not create stock when product creation fails due to duplicate sku', async () => {
    const input = buildInput({ sku: 'DUP-SKU' })

    await sut.execute(input)

    // Segunda tentativa falha antes de persistir — stock não deve ser criado
    await expect(sut.execute({ ...input })).rejects.toThrow(ConflictError)

    expect(stockRepository.items).toHaveLength(1) // somente do primeiro produto
  })
})
