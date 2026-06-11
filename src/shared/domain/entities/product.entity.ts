import { Entity } from '@/shared/domain/entities/entity'

export interface ProductProps {
  name: string
  description: string
  sku: string
  price: number           // em centavos (1999 = R$ 19,99)
  costPrice: number       // em centavos
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
    return this.props.createdAt
  }

  get updatedAt(): Date {
    return this.props.updatedAt
  }

  // ── Regra de negócio: margem de lucro ──
  get profitMargin(): number {
    if (this.costPrice === 0) return 0
    return ((this.price - this.costPrice) / this.costPrice) * 100
  }

  // ── Métodos de atualização ──
  updateName(value: string): void {
    this.props.name = value
    this.props.updatedAt = new Date()
  }

  updateDescription(value: string): void {
    this.props.description = value
    this.props.updatedAt = new Date()
  }

  updatePrice(value: number): void {
    // Regra: preço de venda deve ser maior que custo
    if (value <= this.costPrice) {
      throw new Error('Price must be greater than cost price')
    }
    this.props.price = value
    this.props.updatedAt = new Date()
  }

  updateCostPrice(value: number): void {
    this.props.costPrice = value
    this.props.updatedAt = new Date()
  }

  deactivate(): void {
    this.props.isActive = false
    this.props.updatedAt = new Date()
  }

  activate(): void {
    this.props.isActive = true
    this.props.updatedAt = new Date()
  }

  // NOTA: não existe updateSku() — SKU é imutável após criação
}