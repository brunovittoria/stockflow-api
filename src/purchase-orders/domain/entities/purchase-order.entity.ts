import { Entity } from '@/shared/domain/entities/entity'
import { EntityValidationError } from '@/shared/domain/errors'
import { PurchaseOrderValidatorFactory } from '@/purchase-orders/domain/validators/purchase-order.validator'

export type PurchaseOrderStatus = 'DRAFT' | 'SENT' | 'DELIVERED' | 'CANCELLED'

export interface PurchaseOrderItem {
  productId: string
  quantity: number
  unitCost: number
}

export interface PurchaseOrderProps {
  supplierId: string
  items: PurchaseOrderItem[]
  status: PurchaseOrderStatus
  totalCost: number
  createdAt?: Date
  updatedAt?: Date
}

export class PurchaseOrderEntity extends Entity<PurchaseOrderProps> {
  constructor(
    props: Omit<PurchaseOrderProps, 'totalCost' | 'status'> & {
      status?: PurchaseOrderStatus
      totalCost?: number
    },
    id?: string,
  ) {
    const totalCost = PurchaseOrderEntity.calculateTotalCost(props.items)

    super(
      {
        ...props,
        totalCost,
        status: props.status ?? 'DRAFT',
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? new Date(),
      },
      id,
    )
    this.validate()
  }

  private validate(): void {
    const validator = PurchaseOrderValidatorFactory.create()
    const isValid = validator.validate(this.props)

    if (!isValid) {
      throw new EntityValidationError(validator.errors)
    }
  }

  private static calculateTotalCost(items: PurchaseOrderItem[]): number {
    return items.reduce((sum, item) => sum + item.quantity * item.unitCost, 0)
  }

  // ── Getters ──
  get supplierId(): string {
    return this.props.supplierId
  }

  get items(): PurchaseOrderItem[] {
    return this.props.items
  }

  get status(): PurchaseOrderStatus {
    return this.props.status
  }

  get totalCost(): number {
    return this.props.totalCost
  }

  get createdAt(): Date {
    return this.props.createdAt ?? new Date()
  }

  get updatedAt(): Date {
    return this.props.updatedAt ?? new Date()
  }

  // ── Transições de status ──
  send(): void {
    if (this.props.status !== 'DRAFT') {
      throw new Error('Só pode enviar pedidos com status DRAFT')
    }
    this.props.status = 'SENT'
    this.validate()
    this.props.updatedAt = new Date()
  }

  markAsDelivered(): void {
    if (this.props.status !== 'SENT') {
      throw new Error(
        'Só pode marcar pedidos como entregues se status for SENT',
      )
    }
    this.props.status = 'DELIVERED'
    this.validate()
    this.props.updatedAt = new Date()
  }

  cancel(): void {
    if (this.props.status !== 'DRAFT' && this.props.status !== 'SENT') {
      throw new Error('Só pode cancelar pedidos com status DRAFT ou SENT')
    }
    this.props.status = 'CANCELLED'
    this.validate()
    this.props.updatedAt = new Date()
  }
}
