import { Entity } from '@/shared/domain/entities/entity'
import { EntityValidationError } from '@/shared/domain/errors'
import { ProductValidatorFactory } from '@/products/domain/validators/product.validator'

export interface ProductProps {
  name: string
  description: string
  sku: string
  price: number // em centavos (1999 = R$ 19,99)
  costPrice: number // em centavos
  category: string
  supplierId: string
  isActive: boolean
  createdAt?: Date
  updatedAt?: Date
}

export class ProductEntity extends Entity<ProductProps> {
  constructor(props: ProductProps, id?: string) {
    super(
      {
        ...props,
        isActive: props.isActive ?? true,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? new Date(),
      },
      id,
    )
    this.validate()
  }

  private validate(): void {
    const validator = ProductValidatorFactory.create()
    const isValid = validator.validate(this.props)

    if (!isValid) {
      throw new EntityValidationError(validator.errors)
    }
  }

  // ── Getters ──
  get name(): string {
    return this.props.name
  }

  get description(): string {
    return this.props.description
  }

  get sku(): string {
    return this.props.sku
  }

  get price(): number {
    return this.props.price
  }

  get costPrice(): number {
    return this.props.costPrice
  }

  get category(): string {
    return this.props.category
  }

  get supplierId(): string {
    return this.props.supplierId
  }

  get isActive(): boolean {
    return this.props.isActive
  }

  get createdAt(): Date {
    return this.props.createdAt ?? new Date()
  }

  get updatedAt(): Date {
    return this.props.updatedAt ?? new Date()
  }

  // ── Regra de negócio: margem de lucro ──
  get profitMargin(): number {
    if (this.costPrice === 0) return 0
    return ((this.price - this.costPrice) / this.costPrice) * 100
  }

  // ── Métodos de atualização ──
  updateName(value: string): void {
    this.props.name = value
    this.validate()
    this.props.updatedAt = new Date()
  }

  updateDescription(value: string): void {
    this.props.description = value
    this.validate()
    this.props.updatedAt = new Date()
  }

  updatePrice(value: number): void {
    if (value <= this.costPrice) {
      throw new Error('Price must be greater than cost price')
    }
    this.props.price = value
    this.validate()
    this.props.updatedAt = new Date()
  }

  updateCostPrice(value: number): void {
    this.props.costPrice = value
    this.validate()
    this.props.updatedAt = new Date()
  }

  updateCategory(value: string): void {
    this.props.category = value
    this.validate()
    this.props.updatedAt = new Date()
  }

  deactivate(): void {
    this.props.isActive = false
    this.validate()
    this.props.updatedAt = new Date()
  }

  activate(): void {
    this.props.isActive = true
    this.validate()
    this.props.updatedAt = new Date()
  }

  // NOTA: não existe updateSku() — SKU é imutável após criação
}
