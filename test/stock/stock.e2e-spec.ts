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

type StockResponse = {
  data: {
    id: string
    productId: string
    quantity: number
    minQuantity: number
    location: string
  }
}

type StockCollectionResponse = {
  data: {
    items: StockResponse['data'][]
    total: number
  }
}

describe('StocksController e2e tests', () => {
  let app: INestApplication<App>
  let server: App

  const createSupplierAndProduct = async (): Promise<{
    supplierId: string
    productId: string
  }> => {
    const supplierRes: Response = await request(server)
      .post('/suppliers')
      .send({
        name: 'Fornecedor A',
        email: 'forn@test.com',
        phone: '11999999999',
        cnpj: '12345678000100',
      })
      .expect(201)

    const supplierId = (supplierRes.body as { data: { id: string } }).data.id

    const productRes: Response = await request(server)
      .post('/products')
      .send({
        name: 'Whey Protein 1kg',
        description: 'Suplemento',
        sku: 'WHEY-PT-1KG',
        price: 12000,
        costPrice: 7000,
        category: 'SUPLEMENTOS',
        supplierId,
        location: 'A1',
        minQuantity: 10,
      })
      .expect(201)

    return {
      supplierId,
      productId: (productRes.body as { data: { id: string } }).data.id,
    }
  }

  const getCriticalStock = async (): Promise<StockResponse['data']> => {
    const res = await request(server).get('/stocks/critical').expect(200)
    const body = res.body as StockCollectionResponse
    expect(body.data.items.length).toBeGreaterThan(0)
    return body.data.items[0]
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

  describe('GET /stocks/critical', () => {
    it('should return an empty list when there is no critical stock', async () => {
      const res = await request(server).get('/stocks/critical').expect(200)
      const body = res.body as StockCollectionResponse

      expect(body.data.total).toBe(0)
      expect(body.data.items).toHaveLength(0)
    })

    it('should return stocks where quantity is below minQuantity', async () => {
      const { productId } = await createSupplierAndProduct()
      const stock = await getCriticalStock()

      expect(stock.productId).toBe(productId)
      expect(stock.quantity).toBe(0)
      expect(stock.minQuantity).toBe(10)
    })
  })

  describe('GET /stocks/:id', () => {
    it('should return the stock', async () => {
      await createSupplierAndProduct()
      const created = await getCriticalStock()

      const res = await request(server).get(`/stocks/${created.id}`).expect(200)

      const body = res.body as StockResponse
      expect(body.data.id).toBe(created.id)
      expect(body.data.location).toBe('A1')
    })

    it('should return 404 when stock does not exist', async () => {
      await request(server)
        .get('/stocks/00000000-0000-0000-0000-000000000000')
        .expect(404)
    })
  })

  describe('PUT /stocks/:id', () => {
    it('should update quantity and leave the critical list', async () => {
      await createSupplierAndProduct()
      const created = await getCriticalStock()

      const res = await request(server)
        .put(`/stocks/${created.id}`)
        .send({
          quantity: 50,
          minQuantity: 10,
          location: 'B2',
          isActive: true,
        })
        .expect(200)

      const body = res.body as StockResponse
      expect(body.data.quantity).toBe(50)
      expect(body.data.location).toBe('B2')

      const critical = await request(server).get('/stocks/critical').expect(200)
      expect((critical.body as StockCollectionResponse).data.total).toBe(0)
    })

    it('should return 400 when body is invalid', async () => {
      await createSupplierAndProduct()
      const created = await getCriticalStock()

      await request(server)
        .put(`/stocks/${created.id}`)
        .send({ quantity: -1 })
        .expect(400)
    })
  })
})
