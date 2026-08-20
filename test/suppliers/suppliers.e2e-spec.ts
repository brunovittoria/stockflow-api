import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import request, { type Response } from 'supertest'
import { App } from 'supertest/types'
import { AppModule } from '@/app.module'
import {
  cleanDatabase,
  prisma,
} from '@/shared/infrastructure/database/prisma/testing/setup-prisma-tests'
import { applyGlobalConfig } from '@/global-config'

type SupplierResponse = {
  data: {
    id: string
    name: string
    cnpj: string
    email: string
  }
}

describe('SuppliersController e2e tests', () => {
  let app: INestApplication<App>
  let server: App

  const supplierPayload = (
    overrides: Partial<{
      name: string
      email: string
      phone: string
      cnpj: string
    }> = {},
  ) => ({
    name: 'Fornecedor A',
    email: 'forn@test.com',
    phone: '11999999999',
    cnpj: '12345678000100',
    ...overrides,
  })

  const createSupplier = async (
    overrides: Parameters<typeof supplierPayload>[0] = {},
  ): Promise<SupplierResponse> => {
    const res: Response = await request(server)
      .post('/suppliers')
      .send(supplierPayload(overrides))
      .expect(201)

    return res.body as SupplierResponse
  }

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = module.createNestApplication()
    applyGlobalConfig(app)
    await app.init()
    server = app.getHttpServer()
  })

  beforeEach(async () => {
    await cleanDatabase()
  })

  afterAll(async () => {
    await app.close()
    await prisma.$disconnect()
  })

  describe('POST /suppliers', () => {
    it('should create a supplier', async () => {
      const body = await createSupplier()

      expect(body.data.id).toBeDefined()
      expect(body.data.name).toBe('Fornecedor A')
      expect(body.data.cnpj).toBe('12345678000100')
    })

    it('should return 400 when body is invalid', async () => {
      await request(server)
        .post('/suppliers')
        .send({ name: 'A', cnpj: '123', email: 'not-an-email' })
        .expect(400)
    })

    it('should return 409 when cnpj already exists', async () => {
      await createSupplier()

      await request(server)
        .post('/suppliers')
        .send(
          supplierPayload({ email: 'outro@test.com', phone: '11988888888' }),
        )
        .expect(409)
    })
  })

  describe('GET /suppliers/:id', () => {
    it('should return the supplier', async () => {
      const created = await createSupplier()

      const res = await request(server)
        .get(`/suppliers/${created.data.id}`)
        .expect(200)

      const body = res.body as SupplierResponse
      expect(body.data.id).toBe(created.data.id)
      expect(body.data.cnpj).toBe('12345678000100')
    })

    it('should return 404 when supplier does not exist', async () => {
      await request(server)
        .get('/suppliers/00000000-0000-0000-0000-000000000000')
        .expect(404)
    })
  })

  describe('GET /suppliers', () => {
    it('should return a paginated list', async () => {
      await createSupplier()
      await createSupplier({
        name: 'Fornecedor B',
        email: 'forn-b@test.com',
        phone: '11988888888',
        cnpj: '12345678000101',
      })

      const res = await request(server).get('/suppliers').expect(200)
      const body = res.body as { data: { items: unknown[]; total: number } }

      expect(body.data.total).toBe(2)
      expect(body.data.items).toHaveLength(2)
    })
  })

  describe('PUT /suppliers/:id', () => {
    it('should update the supplier', async () => {
      const created = await createSupplier()

      const res = await request(server)
        .put(`/suppliers/${created.data.id}`)
        .send({
          name: 'Fornecedor Atualizado',
          email: 'novo@test.com',
          phone: '11977777777',
        })
        .expect(200)

      const body = res.body as SupplierResponse
      expect(body.data.name).toBe('Fornecedor Atualizado')
      expect(body.data.email).toBe('novo@test.com')
      expect(body.data.cnpj).toBe('12345678000100')
    })
  })

  describe('DELETE /suppliers/:id', () => {
    it('should return 204 and then 404 on a subsequent GET', async () => {
      const created = await createSupplier()

      await request(server).delete(`/suppliers/${created.data.id}`).expect(204)
      await request(server).get(`/suppliers/${created.data.id}`).expect(404)
    })
  })
})
