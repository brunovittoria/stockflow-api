import { ApiProperty } from '@nestjs/swagger'
import type {
  PurchaseOrderItem,
  PurchaseOrderStatus,
} from '@/purchase-orders/domain/entities/purchase-order.entity'

export type PurchaseOrderOutput = {
  id: string
  supplierId: string
  items: PurchaseOrderItem[]
  status: PurchaseOrderStatus
  totalCost: number
  createdAt: Date
  updatedAt: Date
}

export type PurchaseOrderCollectionOutput = {
  items: PurchaseOrderOutput[]
  total: number
  currentPage: number
  perPage: number
  lastPage: number
}

export class PurchaseOrderItemPresenter {
  @ApiProperty()
  productId!: string
  @ApiProperty()
  quantity!: number
  @ApiProperty()
  unitCost!: number
}

export class PurchaseOrderPresenter {
  @ApiProperty()
  id: string
  @ApiProperty()
  supplierId: string
  @ApiProperty({ type: [PurchaseOrderItemPresenter] })
  items: PurchaseOrderItem[]
  @ApiProperty({ example: 'DRAFT' })
  status: PurchaseOrderStatus
  @ApiProperty()
  totalCost: number
  @ApiProperty()
  createdAt: Date
  @ApiProperty()
  updatedAt: Date

  constructor(output: PurchaseOrderOutput) {
    this.id = output.id
    this.supplierId = output.supplierId
    this.items = output.items
    this.status = output.status
    this.totalCost = output.totalCost
    this.createdAt = output.createdAt
    this.updatedAt = output.updatedAt
  }
}

export class PurchaseOrderCollectionPresenter {
  @ApiProperty({ type: [PurchaseOrderPresenter] })
  items: PurchaseOrderPresenter[]
  @ApiProperty()
  total: number
  @ApiProperty()
  currentPage: number
  @ApiProperty()
  perPage: number
  @ApiProperty()
  lastPage: number

  constructor(output: PurchaseOrderCollectionOutput) {
    this.items = output.items.map((item) => new PurchaseOrderPresenter(item))
    this.total = output.total
    this.currentPage = output.currentPage
    this.perPage = output.perPage
    this.lastPage = output.lastPage
  }
}
