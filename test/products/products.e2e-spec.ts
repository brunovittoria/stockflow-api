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
import { authedRequest, getAccessToken } from '../helpers/auth'

type ProductResponse = {
  data: {
    id: string
    sku: string
    name: string
  }
}

describe('ProductsController e2e tests', () => {
  let app: INestApplication<App>
  let server: App
  let api: ReturnType<typeof authedRequest>

  const productPayload = (supplierId: string, sku = 'CAM-PT-M') => ({
    name: 'Camiseta Preta',
    description: 'Algodão',
    sku,
    price: 5990,
    costPrice: 2500,
    category: 'Vestuário',
    supplierId,
    location: 'A1',
    minQuantity: 10,
  })

  const createSupplier = async (): Promise<string> => {
    const res = await api
      .post('/suppliers')
      .send({
        name: 'Fornecedor A',
        email: 'forn@test.com',
        phone: '11999999999',
        cnpj: '12345678000100',
      })
      .expect(201)

    return (res.body as { data: { id: string } }).data.id
  }

  const createProduct = async (
    supplierId: string,
    sku = 'CAM-PT-M',
  ): Promise<ProductResponse> => {
    const res: Response = await api
      .post('/products')
      .send(productPayload(supplierId, sku))
      .expect(201)

    return res.body as ProductResponse
  }

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = module.createNestApplication()
    applyGlobalConfig(app)
    await app.init()
    server = app.getHttpServer()
    const token = await getAccessToken()
    api = authedRequest(server, token)
  })

  beforeEach(async () => {
    await cleanDatabase()
  })

  afterAll(async () => {
    await app.close()
    await prisma.$disconnect()
  })

  describe('POST /products', () => {
    it('should create a product', async () => {
      const supplierId = await createSupplier()
      const body = await createProduct(supplierId)

      expect(body.data.id).toBeDefined()
      expect(body.data.sku).toBe('CAM-PT-M')
      expect(body.data.name).toBe('Camiseta Preta')
    })

    it('should return 400 when body is invalid', async () => {
      await api
        .post('/products')
        .send({ sku: 'lowercase invalid' })
        .expect(400)
    })

    it('should return 409 when sku already exists', async () => {
      const supplierId = await createSupplier()
      await createProduct(supplierId)

      await api
        .post('/products')
        .send(productPayload(supplierId))
        .expect(409)
    })
  })

  describe('GET /products/:id', () => {
    it('should return the product', async () => {
      const supplierId = await createSupplier()
      const created = await createProduct(supplierId)

      const res = await api
        .get(`/products/${created.data.id}`)
        .expect(200)

      const body = res.body as ProductResponse
      expect(body.data.id).toBe(created.data.id)
      expect(body.data.sku).toBe('CAM-PT-M')
    })

    it('should return 404 when product does not exist', async () => {
      await api
        .get('/products/00000000-0000-0000-0000-000000000000')
        .expect(404)
    })
  })

  describe('DELETE /products/:id', () => {
    it('should return 204 and then 404 on a subsequent GET', async () => {
      const supplierId = await createSupplier()
      const created = await createProduct(supplierId)

      await api.delete(`/products/${created.data.id}`).expect(204)
      await api.get(`/products/${created.data.id}`).expect(404)
    })
  })

  describe('GET /products without token', () => {
    it('should return 401', async () => {
      await request(server).get('/products').expect(401)
    })
  })
})
