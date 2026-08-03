import { ReceiveDeliveryUseCase } from '@/purchase-orders/application/usecases/receive-delivery.usecase'
import { PurchaseOrderInMemoryRepository } from '@/purchase-orders/infrastructure/database/in-memory/purchase-in-memory.repository'
import { StockInMemoryRepository } from '@/stock/infrastructure/database/in-memory/stock-in-memory.repository'
import { PurchaseOrderDataBuilder } from '@/purchase-orders/domain/testing/helpers/purchase-order-data-builder'
import { StockDataBuilder } from '@/stock/domain/testing/helpers/stock-data-builder'
import { PurchaseOrderEntity } from '@/purchase-orders/domain/entities/purchase-order.entity'
import { StockEntity } from '@/stock/domain/entities/stock.entity'
import { NotFoundError, ConflictError } from '@/shared/domain/errors'

describe('ReceiveDeliveryUseCase', () => {
  let sut: ReceiveDeliveryUseCase.UseCase
  let purchaseOrderRepo: PurchaseOrderInMemoryRepository
  let stockRepo: StockInMemoryRepository

  const productId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'

  beforeEach(() => {
    purchaseOrderRepo = new PurchaseOrderInMemoryRepository()
    stockRepo = new StockInMemoryRepository()
    sut = new ReceiveDeliveryUseCase.UseCase(purchaseOrderRepo, stockRepo)
  })

  it('should mark order as DELIVERED and increase stock quantity', async () => {
    const order = new PurchaseOrderEntity(
      PurchaseOrderDataBuilder({
        status: 'SENT',
        items: [{ productId, quantity: 10, unitCost: 100 }],
      }),
    )
    await purchaseOrderRepo.insert(order)

    const stock = new StockEntity(
      StockDataBuilder({ productId, quantity: 5, minQuantity: 2 }),
    )
    await stockRepo.insert(stock)

    const output = await sut.execute({ purchaseOrderId: order.id })

    expect(output.status).toBe('DELIVERED')
    expect(output.updatedStockItems).toHaveLength(1)
    expect(output.updatedStockItems[0].productId).toBe(productId)
    expect(output.updatedStockItems[0].newQuantity).toBe(15) // 5 + 10
  })

  it('should persist DELIVERED status in the repository', async () => {
    const order = new PurchaseOrderEntity(
      PurchaseOrderDataBuilder({
        status: 'SENT',
        items: [{ productId, quantity: 3, unitCost: 100 }],
      }),
    )
    await purchaseOrderRepo.insert(order)
    await stockRepo.insert(
      new StockEntity(
        StockDataBuilder({ productId, quantity: 0, minQuantity: 1 }),
      ),
    )

    await sut.execute({ purchaseOrderId: order.id })

    const persisted = await purchaseOrderRepo.findById(order.id)
    expect(persisted.status).toBe('DELIVERED')
  })

  it('should persist updated stock quantity in the repository', async () => {
    const order = new PurchaseOrderEntity(
      PurchaseOrderDataBuilder({
        status: 'SENT',
        items: [{ productId, quantity: 20, unitCost: 100 }],
      }),
    )
    await purchaseOrderRepo.insert(order)

    const stock = new StockEntity(
      StockDataBuilder({ productId, quantity: 10, minQuantity: 5 }),
    )
    await stockRepo.insert(stock)

    await sut.execute({ purchaseOrderId: order.id })

    const persistedStocks = await stockRepo.findByProductId(productId)
    expect(persistedStocks[0].quantity).toBe(30) // 10 + 20
  })

  it('should update stock for each item in the order', async () => {
    const productId2 = 'a87ff679-a2f3-471d-b9a4-c0a5e98d9e1a'

    const order = new PurchaseOrderEntity(
      PurchaseOrderDataBuilder({
        status: 'SENT',
        items: [
          { productId, quantity: 10, unitCost: 100 },
          { productId: productId2, quantity: 5, unitCost: 200 },
        ],
      }),
    )
    await purchaseOrderRepo.insert(order)

    await stockRepo.insert(
      new StockEntity(
        StockDataBuilder({ productId, quantity: 0, minQuantity: 1 }),
      ),
    )
    await stockRepo.insert(
      new StockEntity(
        StockDataBuilder({
          productId: productId2,
          quantity: 3,
          minQuantity: 1,
        }),
      ),
    )

    const output = await sut.execute({ purchaseOrderId: order.id })

    expect(output.updatedStockItems).toHaveLength(2)
    expect(output.updatedStockItems).toEqual(
      expect.arrayContaining([
        { productId, newQuantity: 10 },
        { productId: productId2, newQuantity: 8 },
      ]),
    )
  })

  it('should throw NotFoundError when purchase order does not exist', async () => {
    await expect(
      sut.execute({ purchaseOrderId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' }),
    ).rejects.toThrow(NotFoundError)
  })

  it('should throw ConflictError when order has status DRAFT', async () => {
    const order = new PurchaseOrderEntity(
      PurchaseOrderDataBuilder({ status: 'DRAFT' }),
    )
    await purchaseOrderRepo.insert(order)

    await expect(sut.execute({ purchaseOrderId: order.id })).rejects.toThrow(
      ConflictError,
    )
  })

  it('should throw ConflictError when order has status DELIVERED', async () => {
    const order = new PurchaseOrderEntity(
      PurchaseOrderDataBuilder({ status: 'DELIVERED' }),
    )
    await purchaseOrderRepo.insert(order)

    await expect(sut.execute({ purchaseOrderId: order.id })).rejects.toThrow(
      ConflictError,
    )
  })

  it('should throw ConflictError when order has status CANCELLED', async () => {
    const order = new PurchaseOrderEntity(
      PurchaseOrderDataBuilder({ status: 'CANCELLED' }),
    )
    await purchaseOrderRepo.insert(order)

    await expect(sut.execute({ purchaseOrderId: order.id })).rejects.toThrow(
      ConflictError,
    )
  })

  it('should throw NotFoundError when stock for a product is not found', async () => {
    const order = new PurchaseOrderEntity(
      PurchaseOrderDataBuilder({
        status: 'SENT',
        items: [{ productId, quantity: 5, unitCost: 100 }],
      }),
    )
    await purchaseOrderRepo.insert(order)
    // stock NOT inserted

    await expect(sut.execute({ purchaseOrderId: order.id })).rejects.toThrow(
      NotFoundError,
    )
  })
})
