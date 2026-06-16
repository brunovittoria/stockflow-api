import {
  SupplierEntity,
  SupplierProps,
} from '@/suppliers/domain/entities/supplier.entity'
import { SupplierDataBuilder } from '@/suppliers/domain/testing/helpers/supplier-data-builder'

describe('SupplierEntity', () => {
  let props: SupplierProps
  let sut: SupplierEntity

  beforeEach(() => {
    props = SupplierDataBuilder({})
    sut = new SupplierEntity(props)
  })

  // ── Construtor ──
  it('should create a supplier with all props', () => {
    expect(sut.props).toStrictEqual(props)
    expect(sut.id).toBeDefined()
  })

  it('should accept an optional id', () => {
    const id = 'custom-id-123'
    const entity = new SupplierEntity(props, id)
    expect(entity.id).toBe(id)
  })

  it('should default isActive to true when not provided', () => {
    const entity = new SupplierEntity({
      name: props.name,
      email: props.email,
      phone: props.phone,
      cnpj: props.cnpj,
    } as SupplierProps)
    expect(entity.isActive).toBe(true)
  })

  // ── Getters ──
  it('should return the name', () => {
    expect(sut.name).toBe(props.name)
  })

  it('should return the email', () => {
    expect(sut.email).toBe(props.email)
  })

  it('should return the phone', () => {
    expect(sut.phone).toBe(props.phone)
  })

  it('should return the cnpj', () => {
    expect(sut.cnpj).toBe(props.cnpj)
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

  // ── Métodos de atualização ──
  it('should update the name', () => {
    sut.updateName('New Name')
    expect(sut.name).toBe('New Name')
  })

  it('should update the email', () => {
    sut.updateEmail('new@email.com')
    expect(sut.email).toBe('new@email.com')
  })

  it('should update the phone', () => {
    sut.updatePhone('11999999999')
    expect(sut.phone).toBe('11999999999')
  })

  it('should update updatedAt when name changes', () => {
    const before = sut.updatedAt
    sut.updateName('Updated')
    expect(sut.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime())
  })

  // ── deactivate / activate ──
  it('should deactivate a supplier', () => {
    sut.deactivate()
    expect(sut.isActive).toBe(false)
  })

  it('should activate a supplier', () => {
    sut.deactivate()
    sut.activate()
    expect(sut.isActive).toBe(true)
  })
})
