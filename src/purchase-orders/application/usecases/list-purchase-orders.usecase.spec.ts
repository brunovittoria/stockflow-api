import { ListPurchaseOrdersUseCase } from '@/purchase-orders/application/usecases/list-purchase-orders.usecase'
import { PurchaseOrderInMemoryRepository } from '@/purchase-orders/infrastructure/database/in-memory/purchase-in-memory.repository'
import { PurchaseOrderDataBuilder } from '@/purchase-orders/domain/testing/helpers/purchase-order-data-builder'
import { PurchaseOrderEntity } from '@/purchase-orders/domain/entities/purchase-order.entity'

describe('ListPurchaseOrdersUseCase', () => {
  let sut: ListPurchaseOrdersUseCase.UseCase
  let repository: PurchaseOrderInMemoryRepository

  beforeEach(() => {
    repository = new PurchaseOrderInMemoryRepository()
    sut = new ListPurchaseOrdersUseCase.UseCase(repository)
  })

  it('should return empty list when no orders exist', async () => {
    const output = await sut.execute({})

    expect(output.items).toHaveLength(0)
    expect(output.total).toBe(0)
  })

  it('should return all orders with default pagination', async () => {
    for (let i = 0; i < 3; i++) {
      await repository.insert(new PurchaseOrderEntity(PurchaseOrderDataBuilder({})))
    }

    const output = await sut.execute({})

    expect(output.items).toHaveLength(3)
    expect(output.total).toBe(3)
    expect(output.currentPage).toBe(1)
    expect(output.perPage).toBe(15)
    expect(output.lastPage).toBe(1)
  })

  it('should filter orders by supplierId', async () => {
    const targetSupplierId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
    const otherSupplierId = 'a87ff679-a2f3-471d-b9a4-c0a5e98d9e1a'

    await repository.insert(
      new PurchaseOrderEntity(PurchaseOrderDataBuilder({ supplierId: targetSupplierId })),
    )
    await repository.insert(
      new PurchaseOrderEntity(PurchaseOrderDataBuilder({ supplierId: targetSupplierId })),
    )
    await repository.insert(
      new PurchaseOrderEntity(PurchaseOrderDataBuilder({ supplierId: otherSupplierId })),
    )

    const output = await sut.execute({ filter: targetSupplierId })

    expect(output.items).toHaveLength(2)
    expect(output.total).toBe(2)
  })

  it('should sort orders by totalCost ascending', async () => {
    await repository.insert(
      new PurchaseOrderEntity(PurchaseOrderDataBuilder({
        items: [{ productId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479', quantity: 10, unitCost: 5000 }],
      })),
    )
    await repository.insert(
      new PurchaseOrderEntity(PurchaseOrderDataBuilder({
        items: [{ productId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479', quantity: 1, unitCost: 1000 }],
      })),
    )
    await repository.insert(
      new PurchaseOrderEntity(PurchaseOrderDataBuilder({
        items: [{ productId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479', quantity: 5, unitCost: 3000 }],
      })),
    )

    const output = await sut.execute({ sort: 'totalCost', sortDir: 'asc' })

    expect(output.items[0].totalCost).toBe(1000)
    expect(output.items[1].totalCost).toBe(15000)
    expect(output.items[2].totalCost).toBe(50000)
  })

  it('should paginate orders correctly', async () => {
    for (let i = 0; i < 5; i++) {
      await repository.insert(new PurchaseOrderEntity(PurchaseOrderDataBuilder({})))
    }

    const page1 = await sut.execute({ page: 1, perPage: 2 })
    const page2 = await sut.execute({ page: 2, perPage: 2 })
    const page3 = await sut.execute({ page: 3, perPage: 2 })

    expect(page1.items).toHaveLength(2)
    expect(page2.items).toHaveLength(2)
    expect(page3.items).toHaveLength(1)
    expect(page1.total).toBe(5)
    expect(page1.lastPage).toBe(3)
  })

  it('should return mapped output without entity methods', async () => {
    const entity = new PurchaseOrderEntity(PurchaseOrderDataBuilder({}))
    await repository.insert(entity)

    const output = await sut.execute({})
    const item = output.items[0]

    expect(item.id).toBe(entity.id)
    expect(item.status).toBe('DRAFT')
    expect(item).not.toHaveProperty('props')
    expect(item).not.toHaveProperty('send')
    expect(item).not.toHaveProperty('cancel')
  })
})
