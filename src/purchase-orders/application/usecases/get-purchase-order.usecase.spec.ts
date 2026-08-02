import { GetPurchaseOrderUseCase } from '@/purchase-orders/application/usecases/get-purchase-order.usecase'
import { PurchaseOrderInMemoryRepository } from '@/purchase-orders/infrastructure/database/in-memory/purchase-in-memory.repository'
import { PurchaseOrderDataBuilder } from '@/purchase-orders/domain/testing/helpers/purchase-order-data-builder'
import { PurchaseOrderEntity } from '@/purchase-orders/domain/entities/purchase-order.entity'
import { NotFoundError } from '@/shared/domain/errors/not-found-error'

describe('GetPurchaseOrderUseCase', () => {
  let sut: GetPurchaseOrderUseCase.UseCase
  let repository: PurchaseOrderInMemoryRepository

  beforeEach(() => {
    repository = new PurchaseOrderInMemoryRepository()
    sut = new GetPurchaseOrderUseCase.UseCase(repository)
  })

  it('should return a purchase order by id', async () => {
    const entity = new PurchaseOrderEntity(PurchaseOrderDataBuilder({}))
    await repository.insert(entity)

    const output = await sut.execute({ id: entity.id })

    expect(output.id).toBe(entity.id)
    expect(output.supplierId).toBe(entity.supplierId)
    expect(output.status).toBe(entity.status)
    expect(output.items).toEqual(entity.items)
    expect(output.totalCost).toBe(entity.totalCost)
    expect(output.createdAt).toEqual(entity.createdAt)
    expect(output.updatedAt).toEqual(entity.updatedAt)
  })

  it('should return status DRAFT for a newly created order', async () => {
    const entity = new PurchaseOrderEntity(PurchaseOrderDataBuilder({}))
    await repository.insert(entity)

    const output = await sut.execute({ id: entity.id })

    expect(output.status).toBe('DRAFT')
  })

  it('should return mapped output without entity methods', async () => {
    const entity = new PurchaseOrderEntity(PurchaseOrderDataBuilder({}))
    await repository.insert(entity)

    const output = await sut.execute({ id: entity.id })

    expect(output).not.toHaveProperty('props')
    expect(output).not.toHaveProperty('send')
    expect(output).not.toHaveProperty('cancel')
    expect(output).not.toHaveProperty('markAsDelivered')
  })

  it('should throw NotFoundError when purchase order does not exist', async () => {
    await expect(sut.execute({ id: 'non-existent-id' })).rejects.toThrow(
      NotFoundError,
    )
  })
})
