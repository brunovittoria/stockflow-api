import { Entity } from '@/shared/domain/entities/entity'

export interface StockProps {
  productId: string
  quantity: number
  minQuantity: number
  location: string
  isActive: boolean
  createdAt?: Date
  updatedAt?: Date
}

export class StockEntity extends Entity<StockProps> {
  constructor(props: StockProps, id?: string) {
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
  get productId(): string {
    return this.props.productId
  }

  get quantity(): number {
    return this.props.quantity
  }

  get minQuantity(): number {
    return this.props.minQuantity
  }

  get location(): string {
    return this.props.location
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

  // ── Regra de negócio: estoque crítico ──
  get isCritical(): boolean {
    return this.props.quantity < this.props.minQuantity
  }

  // ── Métodos de atualização ──
  updateMinQuantity(value: number): void {
    this.props.minQuantity = value
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

  addQuantity(amount: number): void {
    this.props.quantity += amount
    this.props.updatedAt = new Date()
  }

  subtractQuantity(amount: number): void {
    this.props.quantity -= amount
    if (this.props.quantity < 0) {
      throw new Error('Quantity cannot be negative')
    }
    this.props.updatedAt = new Date()
  }

  updateLocation(value: string): void {
    this.props.location = value
    this.props.updatedAt = new Date()
  }
}
