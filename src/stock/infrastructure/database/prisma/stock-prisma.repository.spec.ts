import {
  cleanDatabase,
  prisma,
} from '@/shared/infrastructure/database/prisma/testing/setup-prisma-tests'
import { StockPrismaRepository } from './stock-prisma.repository'
import { StockEntity } from '@/stock/domain/entities/stock.entity'
import { StockDataBuilder } from '@/stock/domain/testing/helpers/stock-data-builder'
import { NotFoundError } from '@/shared/domain/errors'

// Helper: creates supplier + one product (accepts a unique SKU to avoid conflicts)
async function createProductFixture(sku = 'PROD-TEST-001') {
  const supplier = await prisma.supplier.create({
    data: {
      name: 'Fornecedor Teste',
      email: 'forn@test.com',
      phone: '11999999999',
      cnpj: '12345678000100',
    },
  })

  const product = await prisma.product.create({
    data: {
      name: 'Produto Teste',
      description: 'Desc',
      sku,
      category: 'SUPLEMENTOS',
      price: 5000,
      costPrice: 2000,
      isActive: true,
      supplierId: supplier.id,
    },
  })

  return { supplier, product }
}

describe('StockPrismaRepository integration tests', () => {
  let repository: StockPrismaRepository

  beforeAll(() => {
    repository = new StockPrismaRepository(prisma as any)
  })

  beforeEach(async () => {
    await cleanDatabase()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  describe('insert', () => {
    it('should persist the stock in the database', async () => {
      const { product } = await createProductFixture()
      const entity = new StockEntity(
        StockDataBuilder({ productId: product.id }),
      )

      await repository.insert(entity)

      const found = await prisma.stock.findUnique({ where: { id: entity.id } })
      expect(found).toBeDefined()
      expect(found!.productId).toBe(product.id)
      expect(found!.quantity).toBe(entity.quantity)
      expect(found!.location).toBe(entity.location)
    })
  })

  describe('findById', () => {
    it('should return the entity when found', async () => {
      const { product } = await createProductFixture()
      const entity = new StockEntity(
        StockDataBuilder({ productId: product.id }),
      )
      await repository.insert(entity)

      const result = await repository.findById(entity.id)

      expect(result.id).toBe(entity.id)
      expect(result.productId).toBe(product.id)
    })

    it('should throw NotFoundError when id does not exist', async () => {
      await expect(
        repository.findById('00000000-0000-0000-0000-000000000000'),
      ).rejects.toThrow(NotFoundError)
    })
  })

  describe('findByProductId', () => {
    it('should return the stock for a given product', async () => {
      const { product } = await createProductFixture()
      await repository.insert(
        new StockEntity(StockDataBuilder({ productId: product.id })),
      )

      const result = await repository.findByProductId(product.id)

      expect(result).toHaveLength(1)
      expect(result[0].productId).toBe(product.id)
    })

    it('should return empty array when product has no stock entry', async () => {
      const result = await repository.findByProductId(
        '00000000-0000-0000-0000-000000000000',
      )
      expect(result).toHaveLength(0)
    })
  })

  describe('findBelowMinQuantity', () => {
    it('should return only stocks where quantity < minQuantity', async () => {
      // productId is @unique in stocks — need separate products; reuse same supplier
      const { supplier, product: productA } =
        await createProductFixture('PROD-A-001')
      const productB = await prisma.product.create({
        data: {
          name: 'Produto B',
          description: 'Desc',
          sku: 'PROD-B-001',
          category: 'SUPLEMENTOS',
          price: 5000,
          costPrice: 2000,
          isActive: true,
          supplierId: supplier.id,
        },
      })

      const belowMin = new StockEntity(
        StockDataBuilder({
          productId: productA.id,
          quantity: 5,
          minQuantity: 20,
        }),
      )
      const aboveMin = new StockEntity(
        StockDataBuilder({
          productId: productB.id,
          quantity: 50,
          minQuantity: 10,
        }),
      )

      await repository.insert(belowMin)
      await repository.insert(aboveMin)

      const result = await repository.findBelowMinQuantity()

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe(belowMin.id)
    })

    it('should return empty array when all stocks are within limits', async () => {
      const { product } = await createProductFixture()
      await repository.insert(
        new StockEntity(
          StockDataBuilder({
            productId: product.id,
            quantity: 100,
            minQuantity: 5,
          }),
        ),
      )

      const result = await repository.findBelowMinQuantity()

      expect(result).toHaveLength(0)
    })
  })

  describe('update', () => {
    it('should persist updated quantity and location', async () => {
      const { product } = await createProductFixture()
      const entity = new StockEntity(
        StockDataBuilder({
          productId: product.id,
          quantity: 10,
          location: 'A1',
        }),
      )
      await repository.insert(entity)

      entity.updateQuantity(99)
      entity.updateLocation('B5')
      await repository.update(entity)

      const found = await prisma.stock.findUnique({ where: { id: entity.id } })
      expect(found!.quantity).toBe(99)
      expect(found!.location).toBe('B5')
    })
  })

  describe('delete', () => {
    it('should remove the stock from the database', async () => {
      const { product } = await createProductFixture()
      const entity = new StockEntity(
        StockDataBuilder({ productId: product.id }),
      )
      await repository.insert(entity)

      await repository.delete(entity.id)

      const found = await prisma.stock.findUnique({ where: { id: entity.id } })
      expect(found).toBeNull()
    })
  })
})
