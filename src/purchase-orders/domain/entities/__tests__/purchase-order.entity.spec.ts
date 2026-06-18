import { PurchaseOrderEntity } from '@/purchase-orders/domain/entities/purchase-order.entity'
import {
  PurchaseOrderDataBuilder,
  PurchaseOrderDataBuilderProps,
} from '@/purchase-orders/domain/testing/helpers/purchase-order-data-builder'

describe('PurchaseOrderEntity', () => {
  let props: PurchaseOrderDataBuilderProps
  let sut: PurchaseOrderEntity

  beforeEach(() => {
    props = PurchaseOrderDataBuilder({})
    sut = new PurchaseOrderEntity(props)
  })

  // ── Construtor ──
  it('should create a purchase order with all props', () => {
    expect(sut.supplierId).toBe(props.supplierId)
    expect(sut.items).toStrictEqual(props.items)
    expect(sut.id).toBeDefined()
  })

  it('should accept an optional id', () => {
    const id = 'custom-id-123'
    const entity = new PurchaseOrderEntity(props, id)
    expect(entity.id).toBe(id)
  })

  it('should default status to DRAFT when not provided', () => {
    const entity = new PurchaseOrderEntity({
      supplierId: props.supplierId,
      items: props.items,
    })
    expect(entity.status).toBe('DRAFT')
  })

  it('should calculate totalCost automatically in constructor', () => {
    const entity = new PurchaseOrderEntity({
      supplierId: props.supplierId,
      items: [
        { productId: 'p1', quantity: 10, unitCost: 2000 },
        { productId: 'p2', quantity: 5, unitCost: 1000 },
      ],
    })

    // (10 × 2000) + (5 × 1000) = 25000
    expect(entity.totalCost).toBe(25000)
  })

  it('should ignore totalCost passed in props and recalculate', () => {
    const entity = new PurchaseOrderEntity({
      supplierId: props.supplierId,
      items: [{ productId: 'p1', quantity: 2, unitCost: 500 }],
      totalCost: 99999,
    })

    expect(entity.totalCost).toBe(1000)
  })

  // ── Getters ──
  it('should return the supplierId', () => {
    expect(sut.supplierId).toBe(props.supplierId)
  })

  it('should return the items', () => {
    expect(sut.items).toStrictEqual(props.items)
  })

  it('should return the status', () => {
    expect(sut.status).toBe('DRAFT')
  })

  it('should return the totalCost', () => {
    const expected = props.items.reduce(
      (sum, item) => sum + item.quantity * item.unitCost,
      0,
    )
    expect(sut.totalCost).toBe(expected)
  })

  it('should return createdAt', () => {
    expect(sut.createdAt).toBeInstanceOf(Date)
  })

  it('should return updatedAt', () => {
    expect(sut.updatedAt).toBeInstanceOf(Date)
  })

  // ── Transições de status ──
  it('should send a DRAFT order', () => {
    sut.send()
    expect(sut.status).toBe('SENT')
  })

  it('should throw when sending a non-DRAFT order', () => {
    sut.send()
    expect(() => sut.send()).toThrow('Só pode enviar pedidos com status DRAFT')
  })

  it('should mark a SENT order as delivered', () => {
    sut.send()
    sut.markAsDelivered()
    expect(sut.status).toBe('DELIVERED')
  })

  it('should throw when marking a non-SENT order as delivered', () => {
    expect(() => sut.markAsDelivered()).toThrow(
      'Só pode marcar pedidos como entregues se status for SENT',
    )
  })

  it('should cancel a DRAFT order', () => {
    sut.cancel()
    expect(sut.status).toBe('CANCELLED')
  })

  it('should cancel a SENT order', () => {
    sut.send()
    sut.cancel()
    expect(sut.status).toBe('CANCELLED')
  })

  it('should throw when cancelling a DELIVERED order', () => {
    sut.send()
    sut.markAsDelivered()
    expect(() => sut.cancel()).toThrow(
      'Só pode cancelar pedidos com status DRAFT ou SENT',
    )
  })
})
