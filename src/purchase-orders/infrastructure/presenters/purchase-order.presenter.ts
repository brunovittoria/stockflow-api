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

export class PurchaseOrderPresenter {
  id: string
  supplierId: string
  items: PurchaseOrderItem[]
  status: PurchaseOrderStatus
  totalCost: number
  createdAt: Date
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
  items: PurchaseOrderPresenter[]
  total: number
  currentPage: number
  perPage: number
  lastPage: number

  constructor(output: PurchaseOrderCollectionOutput) {
    this.items = output.items.map((item) => new PurchaseOrderPresenter(item))
    this.total = output.total
    this.currentPage = output.currentPage
    this.perPage = output.perPage
    this.lastPage = output.lastPage
  }
}

