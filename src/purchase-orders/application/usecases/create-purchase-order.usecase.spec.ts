import { CreatePurchaseOrderUseCase } from '@/purchase-orders/application/usecases/create-purchase-order.usecase'
import { PurchaseOrderInMemoryRepository } from '@/purchase-orders/infrastructure/database/in-memory/purchase-in-memory.repository'
import { PurchaseOrderDataBuilder } from '@/purchase-orders/domain/testing/helpers/purchase-order-data-builder'

describe('CreatePurchaseOrderUseCase', () => {
  let sut: CreatePurchaseOrderUseCase.UseCase
  let repository: PurchaseOrderInMemoryRepository

  beforeEach(() => {
    repository = new PurchaseOrderInMemoryRepository()
    sut = new CreatePurchaseOrderUseCase.UseCase(repository)
  })

  it('should create a purchase order with status DRAFT', async () => {
    const data = PurchaseOrderDataBuilder({})

    const output = await sut.execute({
      supplierId: data.supplierId,
      items: data.items,
    })

    expect(output.id).toBeDefined()
    expect(output.supplierId).toBe(data.supplierId)
    expect(output.status).toBe('DRAFT')
    expect(output.items).toEqual(data.items)
    expect(repository.items).toHaveLength(1)
  })

  it('should calculate totalCost correctly', async () => {
    const { supplierId } = PurchaseOrderDataBuilder({})

    const output = await sut.execute({
      supplierId,
      items: [
        {
          productId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
          quantity: 10,
          unitCost: 2500,
        },
        {
          productId: 'a87ff679-a2f3-471d-b9a4-c0a5e98d9e1a',
          quantity: 5,
          unitCost: 1000,
        },
      ],
    })

    // (10 * 2500) + (5 * 1000) = 25000 + 5000 = 30000
    expect(output.totalCost).toBe(30000)
  })

  it('should allow multiple purchase orders for the same supplier', async () => {
    const data = PurchaseOrderDataBuilder({})

    await sut.execute({ supplierId: data.supplierId, items: data.items })
    await sut.execute({ supplierId: data.supplierId, items: data.items })

    expect(repository.items).toHaveLength(2)
  })

  it('should throw when items list is empty', async () => {
    const { supplierId } = PurchaseOrderDataBuilder({})

    await expect(sut.execute({ supplierId, items: [] })).rejects.toThrow()
  })
})
