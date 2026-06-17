import { StockEntity, StockProps } from '@/stock/domain/entities/stock.entity'
import { StockDataBuilder } from '@/stock/domain/testing/helpers/stock-data-builder'

describe('StockEntity', () => {
  let props: StockProps
  let sut: StockEntity

  beforeEach(() => {
    props = StockDataBuilder({ quantity: 50, minQuantity: 10 })
    sut = new StockEntity(props)
  })

  // ── Construtor ──
  it('should create a stock with all props', () => {
    expect(sut.props).toStrictEqual(props)
    expect(sut.id).toBeDefined()
  })

  it('should accept an optional id', () => {
    const id = 'custom-id-123'
    const entity = new StockEntity(props, id)
    expect(entity.id).toBe(id)
  })

  it('should default isActive to true when not provided', () => {
    const entity = new StockEntity({
      productId: props.productId,
      quantity: props.quantity,
      minQuantity: props.minQuantity,
      location: props.location,
    } as StockProps)
    expect(entity.isActive).toBe(true)
  })

  // ── Getters ──
  it('should return the productId', () => {
    expect(sut.productId).toBe(props.productId)
  })

  it('should return the quantity', () => {
    expect(sut.quantity).toBe(50)
  })

  it('should return the minQuantity', () => {
    expect(sut.minQuantity).toBe(10)
  })

  it('should return the location', () => {
    expect(sut.location).toBe(props.location)
  })

  it('should return isActive', () => {
    expect(sut.isActive).toBe(true)
  })

  it('should return createdAt', () => {
    expect(sut.createdAt).toBeInstanceOf(Date)
  })

  it('should return updatedAt', () => {
    expect(sut.updatedAt).toBeInstanceOf(Date)
  })

  // ── Regra de negócio: estoque crítico ──
  it('should return isCritical as false when quantity is above minQuantity', () => {
    expect(sut.isCritical).toBe(false)
  })

  it('should return isCritical as true when quantity is below minQuantity', () => {
    const critical = new StockEntity(
      StockDataBuilder({ quantity: 5, minQuantity: 10 }),
    )
    expect(critical.isCritical).toBe(true)
  })

  // ── Métodos de atualização ──
  it('should update minQuantity', () => {
    sut.updateMinQuantity(20)
    expect(sut.minQuantity).toBe(20)
  })

  it('should update location', () => {
    sut.updateLocation('Prateleira B2')
    expect(sut.location).toBe('Prateleira B2')
  })

  it('should update updatedAt when location changes', () => {
    const before = sut.updatedAt
    sut.updateLocation('Depósito 1')
    expect(sut.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime())
  })

  it('should add quantity', () => {
    sut.addQuantity(10)
    expect(sut.quantity).toBe(60)
  })

  it('should subtract quantity', () => {
    sut.subtractQuantity(20)
    expect(sut.quantity).toBe(30)
  })

  it('should throw when subtracting more than available quantity', () => {
    expect(() => sut.subtractQuantity(100)).toThrow(
      'Quantity cannot be negative',
    )
  })

  // ── deactivate / activate ──
  it('should deactivate stock', () => {
    sut.deactivate()
    expect(sut.isActive).toBe(false)
  })

  it('should activate stock', () => {
    sut.deactivate()
    sut.activate()
    expect(sut.isActive).toBe(true)
  })
})
