import { Entity } from '@/shared/domain/entities/entity'

export interface SupplierProps {
  name: string
  email: string
  phone: string
  cnpj: string
  isActive: boolean
  createdAt?: Date
  updatedAt?: Date
}

export class SupplierEntity extends Entity<SupplierProps> {
  constructor(props: SupplierProps, id?: string) {
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

  get email(): string {
    return this.props.email
  }

  get phone(): string {
    return this.props.phone
  }

  get cnpj(): string {
    return this.props.cnpj
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

  // ── Métodos de atualização ──
  updateName(value: string): void {
    this.props.name = value
    this.props.updatedAt = new Date()
  }

  updateEmail(value: string): void {
    this.props.email = value
    this.props.updatedAt = new Date()
  }

  updatePhone(value: string): void {
    this.props.phone = value
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
}
