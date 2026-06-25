import { Entity } from '@/shared/domain/entities/entity'
import { EntityValidationError } from '@/shared/domain/errors'
import { SupplierValidatorFactory } from '@/suppliers/domain/validators/supplier.validator'

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
    this.validate()
  }

  private validate(): void {
    const validator = SupplierValidatorFactory.create()
    const isValid = validator.validate(this.props)

    if (!isValid) {
      throw new EntityValidationError(validator.errors)
    }
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
    this.validate()
    this.props.updatedAt = new Date()
  }

  updateEmail(value: string): void {
    this.props.email = value
    this.validate()
    this.props.updatedAt = new Date()
  }

  updatePhone(value: string): void {
    this.props.phone = value
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
}
