export type ProductOutput = {
  id: string
  name: string
  description: string
  sku: string
  price: number
  costPrice: number
  category: string
  supplierId: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export type ProductCollectionOutput = {
  items: ProductOutput[]
  total: number
  currentPage: number
  perPage: number
  lastPage: number
}

export class ProductPresenter {
  id: string
  name: string
  description: string
  sku: string
  price: number
  costPrice: number
  category: string
  supplierId: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date

  constructor(output: ProductOutput) {
    this.id = output.id
    this.name = output.name
    this.description = output.description
    this.sku = output.sku
    this.price = output.price
    this.costPrice = output.costPrice
    this.category = output.category
    this.supplierId = output.supplierId
    this.isActive = output.isActive
    this.createdAt = output.createdAt
    this.updatedAt = output.updatedAt
  }
}

export class ProductCollectionPresenter {
  items: ProductPresenter[]
  total: number
  currentPage: number
  perPage: number
  lastPage: number

  constructor(output: ProductCollectionOutput) {
    this.items = output.items.map((item) => new ProductPresenter(item))
    this.total = output.total
    this.currentPage = output.currentPage
    this.perPage = output.perPage
    this.lastPage = output.lastPage
  }
}
