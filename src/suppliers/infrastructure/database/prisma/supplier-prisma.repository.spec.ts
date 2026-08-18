import {
  cleanDatabase,
  prisma,
} from '@/shared/infrastructure/database/prisma/testing/setup-prisma-tests'
import { SupplierPrismaRepository } from './supplier-prisma.repository'
import { SupplierEntity } from '@/suppliers/domain/entities/supplier.entity'
import { SupplierDataBuilder } from '@/suppliers/domain/testing/helpers/supplier-data-builder'
import { NotFoundError } from '@/shared/domain/errors'

describe('SupplierPrismaRepository integration tests', () => {
  let repository: SupplierPrismaRepository

  beforeAll(() => {
    repository = new SupplierPrismaRepository(prisma as any)
  })

  beforeEach(async () => {
    await cleanDatabase()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  describe('insert', () => {
    it('should persist the supplier in the database', async () => {
      const entity = new SupplierEntity(SupplierDataBuilder())

      await repository.insert(entity)

      const found = await prisma.supplier.findUnique({
        where: { id: entity.id },
      })
      expect(found).toBeDefined()
      expect(found!.name).toBe(entity.name)
      expect(found!.cnpj).toBe(entity.cnpj)
      expect(found!.email).toBe(entity.email)
    })
  })

  describe('findById', () => {
    it('should return the entity when found', async () => {
      const entity = new SupplierEntity(SupplierDataBuilder())
      await repository.insert(entity)

      const result = await repository.findById(entity.id)

      expect(result.id).toBe(entity.id)
      expect(result.name).toBe(entity.name)
      expect(result.cnpj).toBe(entity.cnpj)
    })

    it('should throw NotFoundError when id does not exist', async () => {
      await expect(
        repository.findById('00000000-0000-0000-0000-000000000000'),
      ).rejects.toThrow(NotFoundError)
    })
  })

  describe('findByCnpj', () => {
    it('should return the matching supplier', async () => {
      const entity = new SupplierEntity(
        SupplierDataBuilder({ cnpj: '12345678000100' }),
      )
      await repository.insert(entity)

      const result = await repository.findByCnpj('12345678000100')

      expect(result).toHaveLength(1)
      expect(result[0].cnpj).toBe('12345678000100')
    })

    it('should return empty array when CNPJ is not found', async () => {
      const result = await repository.findByCnpj('99999999999999')
      expect(result).toHaveLength(0)
    })
  })

  describe('findByName', () => {
    it('should return suppliers with a partial, case-insensitive name match', async () => {
      const entity = new SupplierEntity(
        SupplierDataBuilder({ name: 'Distribuidora Fitness ABC' }),
      )
      await repository.insert(entity)

      const result = await repository.findByName('fitness')

      expect(result.length).toBeGreaterThanOrEqual(1)
      expect(result[0].name).toContain('Fitness')
    })

    it('should return empty array when no name matches', async () => {
      const result = await repository.findByName('xyznonexistent')
      expect(result).toHaveLength(0)
    })
  })

  describe('update', () => {
    it('should persist the updated fields', async () => {
      const entity = new SupplierEntity(
        SupplierDataBuilder({ name: 'Old Name' }),
      )
      await repository.insert(entity)

      entity.updateName('New Name')
      await repository.update(entity)

      const found = await prisma.supplier.findUnique({
        where: { id: entity.id },
      })
      expect(found!.name).toBe('New Name')
    })

    it('should not change immutable fields (cnpj, createdAt)', async () => {
      const entity = new SupplierEntity(SupplierDataBuilder())
      await repository.insert(entity)
      const originalCnpj = entity.cnpj

      entity.updateName('Changed')
      await repository.update(entity)

      const found = await prisma.supplier.findUnique({
        where: { id: entity.id },
      })
      expect(found!.cnpj).toBe(originalCnpj)
    })
  })

  describe('delete', () => {
    it('should remove the supplier from the database', async () => {
      const entity = new SupplierEntity(SupplierDataBuilder())
      await repository.insert(entity)

      await repository.delete(entity.id)

      const found = await prisma.supplier.findUnique({
        where: { id: entity.id },
      })
      expect(found).toBeNull()
    })
  })

  describe('search', () => {
    it('should return paginated results', async () => {
      await repository.insert(
        new SupplierEntity(SupplierDataBuilder({ name: 'Alpha Supplier' })),
      )
      await repository.insert(
        new SupplierEntity(SupplierDataBuilder({ name: 'Beta Supplier' })),
      )
      await repository.insert(
        new SupplierEntity(SupplierDataBuilder({ name: 'Gamma Supplier' })),
      )

      const result = await repository.search({ page: 1, perPage: 2 })

      expect(result.total).toBe(3)
      expect(result.items).toHaveLength(2)
      expect(result.currentPage).toBe(1)
      expect(result.lastPage).toBe(2)
    })
  })
})
