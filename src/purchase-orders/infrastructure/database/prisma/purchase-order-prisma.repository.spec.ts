import {
  cleanDatabase,
  prisma,
} from '@/shared/infrastructure/database/prisma/testing/setup-prisma-tests'
import { PurchaseOrderPrismaRepository } from './purchase-order-prisma.repository'
import { PurchaseOrderEntity } from '@/purchase-orders/domain/entities/purchase-order.entity'
import { NotFoundError } from '@/shared/domain/errors'

// Helper: creates supplier + product dependencies required by PurchaseOrder (FK)
async function createFixtures() {
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
      name: 'Whey Protein 1kg',
      description: 'Suplemento',
      sku: 'WHEY-PT-1KG',
      category: 'SUPLEMENTOS',
      price: 12000,
      costPrice: 7000,
      isActive: true,
      supplierId: supplier.id,
    },
  })

  return { supplier, product }
}

// Builds a valid PurchaseOrderEntity using real DB IDs
function buildOrder(
  supplierId: string,
  productId: string,
): PurchaseOrderEntity {
  return new PurchaseOrderEntity({
    supplierId,
    items: [{ productId, quantity: 10, unitCost: 7000 }],
  })
}

describe('PurchaseOrderPrismaRepository integration tests', () => {
  let repository: PurchaseOrderPrismaRepository

  beforeAll(() => {
    repository = new PurchaseOrderPrismaRepository(prisma as any)
  })

  beforeEach(async () => {
    await cleanDatabase()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  describe('insert', () => {
    it('should persist the order and its items in the database', async () => {
      const { supplier, product } = await createFixtures()
      const entity = buildOrder(supplier.id, product.id)

      await repository.insert(entity)

      const found = await prisma.purchaseOrder.findUnique({
        where: { id: entity.id },
        include: { items: true },
      })
      expect(found).toBeDefined()
      expect(found!.supplierId).toBe(supplier.id)
      expect(found!.status).toBe('DRAFT')
      expect(found!.items).toHaveLength(1)
      expect(found!.items[0].productId).toBe(product.id)
      expect(found!.items[0].quantity).toBe(10)
    })
  })

  describe('findById', () => {
    it('should return the entity with items when found', async () => {
      const { supplier, product } = await createFixtures()
      const entity = buildOrder(supplier.id, product.id)
      await repository.insert(entity)

      const result = await repository.findById(entity.id)

      expect(result.id).toBe(entity.id)
      expect(result.supplierId).toBe(supplier.id)
      expect(result.items).toHaveLength(1)
      expect(result.items[0].productId).toBe(product.id)
      expect(result.totalCost).toBe(70000) // 10 * 7000
    })

    it('should throw NotFoundError when id does not exist', async () => {
      await expect(
        repository.findById('00000000-0000-0000-0000-000000000000'),
      ).rejects.toThrow(NotFoundError)
    })
  })

  describe('findBySupplierId', () => {
    it('should return all orders for the given supplier', async () => {
      const { supplier, product } = await createFixtures()
      await repository.insert(buildOrder(supplier.id, product.id))
      await repository.insert(buildOrder(supplier.id, product.id))

      const result = await repository.findBySupplierId(supplier.id)

      expect(result).toHaveLength(2)
      result.forEach((order) => expect(order.supplierId).toBe(supplier.id))
    })

    it('should return empty array when supplier has no orders', async () => {
      const result = await repository.findBySupplierId(
        '00000000-0000-0000-0000-000000000000',
      )
      expect(result).toHaveLength(0)
    })
  })

  describe('findByStatus', () => {
    it('should return orders filtered by status', async () => {
      const { supplier, product } = await createFixtures()
      const draftOrder = buildOrder(supplier.id, product.id)
      await repository.insert(draftOrder)

      const result = await repository.findByStatus('DRAFT')

      expect(result).toHaveLength(1)
      expect(result[0].status).toBe('DRAFT')
    })

    it('should return empty array when no orders match the status', async () => {
      const result = await repository.findByStatus('DELIVERED')
      expect(result).toHaveLength(0)
    })
  })

  describe('findByProductId', () => {
    it('should return orders that contain the given product', async () => {
      const { supplier, product } = await createFixtures()
      await repository.insert(buildOrder(supplier.id, product.id))

      const result = await repository.findByProductId(product.id)

      expect(result).toHaveLength(1)
      expect(result[0].items[0].productId).toBe(product.id)
    })

    it('should return empty array when product is not in any order', async () => {
      const result = await repository.findByProductId(
        '00000000-0000-0000-0000-000000000000',
      )
      expect(result).toHaveLength(0)
    })
  })

  describe('findActiveOrders', () => {
    it('should return only DRAFT and SENT orders for a supplier', async () => {
      const { supplier, product } = await createFixtures()

      const draftOrder = buildOrder(supplier.id, product.id)
      await repository.insert(draftOrder)

      // Manually save a DELIVERED order (bypassing entity transitions)
      await prisma.purchaseOrder.create({
        data: {
          supplierId: supplier.id,
          status: 'DELIVERED',
          totalCost: 70000,
          items: {
            create: [{ productId: product.id, quantity: 10, unitCost: 7000 }],
          },
        },
      })

      const result = await repository.findActiveOrders(supplier.id)

      expect(result).toHaveLength(1)
      expect(result[0].status).toBe('DRAFT')
    })
  })

  describe('update', () => {
    it('should persist status changes', async () => {
      const { supplier, product } = await createFixtures()
      const entity = buildOrder(supplier.id, product.id)
      await repository.insert(entity)

      entity.send()
      await repository.update(entity)

      const found = await prisma.purchaseOrder.findUnique({
        where: { id: entity.id },
      })
      expect(found!.status).toBe('SENT')
    })
  })

  describe('delete', () => {
    it('should remove the order and its items from the database', async () => {
      const { supplier, product } = await createFixtures()
      const entity = buildOrder(supplier.id, product.id)
      await repository.insert(entity)

      await repository.delete(entity.id)

      const found = await prisma.purchaseOrder.findUnique({
        where: { id: entity.id },
      })
      expect(found).toBeNull()

      const items = await prisma.purchaseOrderItem.findMany({
        where: { purchaseOrderId: entity.id },
      })
      expect(items).toHaveLength(0)
    })
  })
})
