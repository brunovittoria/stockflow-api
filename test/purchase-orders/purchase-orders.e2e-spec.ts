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

type PurchaseOrderResponse = {
  data: {
    id: string
    supplierId: string
    status: string
    totalCost: number
    items: Array<{ productId: string; quantity: number; unitCost: number }>
  }
}

describe('PurchaseOrderController e2e tests', () => {
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

  const orderPayload = (supplierId: string, productId: string) => ({
    supplierId,
    items: [{ productId, quantity: 10, unitCost: 7000 }],
  })

  const createOrder = async (
    supplierId: string,
    productId: string,
  ): Promise<PurchaseOrderResponse> => {
    const res: Response = await request(server)
      .post('/purchase-orders')
      .send(orderPayload(supplierId, productId))
      .expect(201)

    return res.body as PurchaseOrderResponse
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

  describe('POST /purchase-orders', () => {
    it('should create a draft order with calculated totalCost', async () => {
      const { supplierId, productId } = await createSupplierAndProduct()
      const body = await createOrder(supplierId, productId)

      expect(body.data.id).toBeDefined()
      expect(body.data.status).toBe('DRAFT')
      expect(body.data.totalCost).toBe(70000)
      expect(body.data.items).toHaveLength(1)
      expect(body.data.items[0].productId).toBe(productId)
    })

    it('should return 400 when items are empty', async () => {
      const { supplierId } = await createSupplierAndProduct()

      await request(server)
        .post('/purchase-orders')
        .send({ supplierId, items: [] })
        .expect(400)
    })
  })

  describe('GET /purchase-orders/:id', () => {
    it('should return the order', async () => {
      const { supplierId, productId } = await createSupplierAndProduct()
      const created = await createOrder(supplierId, productId)

      const res = await request(server)
        .get(`/purchase-orders/${created.data.id}`)
        .expect(200)

      const body = res.body as PurchaseOrderResponse
      expect(body.data.id).toBe(created.data.id)
      expect(body.data.status).toBe('DRAFT')
    })

    it('should return 404 when order does not exist', async () => {
      await request(server)
        .get('/purchase-orders/00000000-0000-0000-0000-000000000000')
        .expect(404)
    })
  })

  describe('GET /purchase-orders', () => {
    it('should return a paginated list', async () => {
      const { supplierId, productId } = await createSupplierAndProduct()
      await createOrder(supplierId, productId)

      const res = await request(server).get('/purchase-orders').expect(200)
      const body = res.body as { data: { items: unknown[]; total: number } }

      expect(body.data.total).toBe(1)
      expect(body.data.items).toHaveLength(1)
    })
  })

  describe('POST /purchase-orders/:id/cancel', () => {
    it('should cancel a DRAFT order', async () => {
      const { supplierId, productId } = await createSupplierAndProduct()
      const created = await createOrder(supplierId, productId)

      const res = await request(server)
        .post(`/purchase-orders/${created.data.id}/cancel`)
        .expect(201)

      const body = res.body as PurchaseOrderResponse
      expect(body.data.status).toBe('CANCELLED')
    })
  })

  describe('POST /purchase-orders/:id/receive-delivery', () => {
    it('should return 409 when the order is still DRAFT', async () => {
      const { supplierId, productId } = await createSupplierAndProduct()
      const created = await createOrder(supplierId, productId)

      await request(server)
        .post(`/purchase-orders/${created.data.id}/receive-delivery`)
        .expect(409)
    })

    it('should mark a SENT order as DELIVERED and increase stock', async () => {
      const { supplierId, productId } = await createSupplierAndProduct()
      const created = await createOrder(supplierId, productId)

      // Não há rota HTTP de send — o pedido precisa estar SENT para receber a entrega
      await prisma.purchaseOrder.update({
        where: { id: created.data.id },
        data: { status: 'SENT' },
      })

      const res = await request(server)
        .post(`/purchase-orders/${created.data.id}/receive-delivery`)
        .expect(201)

      const body = res.body as {
        data: {
          id: string
          status: string
          updatedStockItems: Array<{ productId: string; newQuantity: number }>
        }
      }

      expect(body.data.status).toBe('DELIVERED')
      expect(body.data.updatedStockItems).toHaveLength(1)
      expect(body.data.updatedStockItems[0].productId).toBe(productId)
      expect(body.data.updatedStockItems[0].newQuantity).toBe(10)
    })
  })
})
