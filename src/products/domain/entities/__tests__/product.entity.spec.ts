import {
  ProductEntity,
  ProductProps,
} from '@/products/domain/entities/product.entity'
import { ProductDataBuilder } from '@/products/domain/testing/helpers/product-data-builder'
import { EntityValidationError } from '@/shared/domain/errors'

// ── Testes da Entidade ──
describe('ProductEntity', () => {
  let props: ProductProps
  let sut: ProductEntity

  beforeEach(() => {
    props = ProductDataBuilder({ price: 5000, costPrice: 2000 })
    sut = new ProductEntity(props)
  })

  // ── Construtor ──
  it('should create a product with all props', () => {
    expect(sut.props).toStrictEqual(props)
    expect(sut.id).toBeDefined()
  })

  it('should accept an optional id', () => {
    const id = 'custom-id-123'
    const entity = new ProductEntity(props, id)
    expect(entity.id).toBe(id)
  })

  // ── Getters ──
  it('should return the name', () => {
    expect(sut.name).toBe(props.name)
  })

  it('should return the sku', () => {
    expect(sut.sku).toBe(props.sku)
  })

  it('should calculate profit margin', () => {
    // price=5000, costPrice=2000 → margin = ((5000-2000)/2000)*100 = 150%
    expect(sut.profitMargin).toBe(150)
  })

  // ── Métodos de atualização ──
  it('should update the name', () => {
    sut.updateName('New Name')
    expect(sut.name).toBe('New Name')
  })

  it('should throw when price is less than cost', () => {
    expect(() => sut.updatePrice(1000)).toThrow(
      'Price must be greater than cost price',
    )
  })

  it('should update price when valid', () => {
    sut.updatePrice(8000)
    expect(sut.price).toBe(8000)
  })

  it('should deactivate product', () => {
    sut.deactivate()
    expect(sut.isActive).toBe(false)
  })
})

// ── Testes de Validação ──
describe('ProductEntity validation', () => {
  it('should throw when name is empty', () => {
    const props = ProductDataBuilder({ name: '' })
    expect(() => new ProductEntity(props)).toThrow(EntityValidationError)
  })

  it('should throw when sku has invalid format', () => {
    const props = ProductDataBuilder({ sku: 'abc lowercase' })
    expect(() => new ProductEntity(props)).toThrow(EntityValidationError)
  })

  it('should throw when price is negative', () => {
    const props = ProductDataBuilder({ price: -100 })
    expect(() => new ProductEntity(props)).toThrow(EntityValidationError)
  })

  it('should accept valid props', () => {
    const props = ProductDataBuilder({
      sku: 'CAM-PT-M',
      price: 5000,
      costPrice: 2000,
    })
    const product = new ProductEntity(props)
    expect(product.sku).toBe('CAM-PT-M')
  })
})
