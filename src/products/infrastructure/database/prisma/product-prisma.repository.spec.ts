import {
  cleanDatabase,
  prisma,
} from '@/shared/infrastructure/database/prisma/testing/setup-prisma-tests'
import { ProductPrismaRepository } from './product-prisma.repository'
import { ProductEntity } from '@/products/domain/entities/product.entity'
import { ProductDataBuilder } from '@/products/domain/testing/helpers/product-data-builder'
import { NotFoundError } from '@/shared/domain/errors'
import type { PrismaService } from '@/shared/infrastructure/database/prisma/prisma.service'

describe('ProductPrismaRepository integration tests', () => {
  let repository: ProductPrismaRepository

  beforeAll(() => {
    repository = new ProductPrismaRepository(prisma as unknown as PrismaService)
  })

  beforeEach(async () => {
    await cleanDatabase()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  describe('insert', () => {
    it('should persist the product in the database', async () => {
      const supplier = await prisma.supplier.create({
        data: {
          name: 'Fornecedor Teste',
          email: 'forn@test.com',
          phone: '11999999999',
          cnpj: '12345678000100',
        },
      })

      const entity = new ProductEntity(
        ProductDataBuilder({
          supplierId: supplier.id,
          price: 5000,
          costPrice: 2000,
        }),
      )

      await repository.insert(entity)

      const found = await prisma.product.findUnique({
        where: { id: entity.id },
      })

      expect(found).toBeDefined()
      expect(found!.name).toBe(entity.name)
      expect(found!.sku).toBe(entity.sku)
    })
  })

  describe('findById', () => {
    it('should return the entity when found', async () => {
      const supplier = await prisma.supplier.create({
        data: {
          name: 'Fornecedor Teste',
          email: 'forn@test.com',
          phone: '11999999999',
          cnpj: '12345678000100',
        },
      })

      const entity = new ProductEntity(
        ProductDataBuilder({
          supplierId: supplier.id,
          price: 5000,
          costPrice: 2000,
        }),
      )
      await repository.insert(entity)

      const result = await repository.findById(entity.id)

      expect(result.id).toBe(entity.id)
      expect(result.name).toBe(entity.name)
    })

    it('should throw NotFoundError when id does not exist', async () => {
      await expect(
        repository.findById('00000000-0000-0000-0000-000000000000'),
      ).rejects.toThrow(NotFoundError)
    })
  })
})
