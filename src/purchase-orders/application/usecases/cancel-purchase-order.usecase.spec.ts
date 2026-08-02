import { CancelPurchaseOrderUseCase } from '@/purchase-orders/application/usecases/cancel-purchase-order.usecase'
import { PurchaseOrderInMemoryRepository } from '@/purchase-orders/infrastructure/database/in-memory/purchase-in-memory.repository'
import { PurchaseOrderDataBuilder } from '@/purchase-orders/domain/testing/helpers/purchase-order-data-builder'
import { PurchaseOrderEntity } from '@/purchase-orders/domain/entities/purchase-order.entity'
import { NotFoundError, ConflictError } from '@/shared/domain/errors'

describe('CancelPurchaseOrderUseCase', () => {
  let sut: CancelPurchaseOrderUseCase.UseCase
  let repository: PurchaseOrderInMemoryRepository

  beforeEach(() => {
    repository = new PurchaseOrderInMemoryRepository()
    sut = new CancelPurchaseOrderUseCase.UseCase(repository)
  })

  it('should cancel a purchase order with status DRAFT', async () => {
    const entity = new PurchaseOrderEntity(
      PurchaseOrderDataBuilder({ status: 'DRAFT' }),
    )
    await repository.insert(entity)

    const output = await sut.execute({ id: entity.id })

    expect(output.status).toBe('CANCELLED')
    expect(output.id).toBe(entity.id)
  })

  it('should cancel a purchase order with status SENT', async () => {
    const entity = new PurchaseOrderEntity(
      PurchaseOrderDataBuilder({ status: 'SENT' }),
    )
    await repository.insert(entity)

    const output = await sut.execute({ id: entity.id })

    expect(output.status).toBe('CANCELLED')
  })

  it('should persist the CANCELLED status in the repository', async () => {
    const entity = new PurchaseOrderEntity(
      PurchaseOrderDataBuilder({ status: 'DRAFT' }),
    )
    await repository.insert(entity)

    await sut.execute({ id: entity.id })

    const persisted = await repository.findById(entity.id)
    expect(persisted.status).toBe('CANCELLED')
  })

  it('should NOT delete the order from the repository — only update its status', async () => {
    const entity = new PurchaseOrderEntity(
      PurchaseOrderDataBuilder({ status: 'DRAFT' }),
    )
    await repository.insert(entity)

    await sut.execute({ id: entity.id })

    expect(repository.items).toHaveLength(1)
  })

  it('should return mapped output without entity methods', async () => {
    const entity = new PurchaseOrderEntity(
      PurchaseOrderDataBuilder({ status: 'DRAFT' }),
    )
    await repository.insert(entity)

    const output = await sut.execute({ id: entity.id })

    expect(output).toHaveProperty('id')
    expect(output).toHaveProperty('supplierId')
    expect(output).toHaveProperty('status')
    expect(output).toHaveProperty('items')
    expect(output).toHaveProperty('totalCost')
    expect(output).toHaveProperty('createdAt')
    expect(output).toHaveProperty('updatedAt')
    expect(output).not.toHaveProperty('props')
    expect(output).not.toHaveProperty('cancel')
  })

  it('should throw NotFoundError when purchase order does not exist', async () => {
    await expect(
      sut.execute({ id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' }),
    ).rejects.toThrow(NotFoundError)
  })

  it('should throw ConflictError when order is already DELIVERED', async () => {
    const entity = new PurchaseOrderEntity(
      PurchaseOrderDataBuilder({ status: 'DELIVERED' }),
    )
    await repository.insert(entity)

    await expect(sut.execute({ id: entity.id })).rejects.toThrow(ConflictError)
  })

  it('should throw ConflictError when order is already CANCELLED', async () => {
    const entity = new PurchaseOrderEntity(
      PurchaseOrderDataBuilder({ status: 'CANCELLED' }),
    )
    await repository.insert(entity)

    await expect(sut.execute({ id: entity.id })).rejects.toThrow(ConflictError)
  })
})
