// Contrato de entrada do StockPresenter: campos que qualquer use case de stock deve retornar.
export type StockOutput = {
  id: string
  productId: string
  quantity: number
  minQuantity: number
  location: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// Contrato de entrada do StockCollectionPresenter.
// currentPage, perPage e lastPage são opcionais pois ListCriticalStock não é paginado.
export type StockCollectionOutput = {
  items: StockOutput[]
  total: number
  currentPage?: number
  perPage?: number
  lastPage?: number
}

// Classe que formata a resposta de um único estoque.
// É uma classe (não um type) porque o NestJS serializa instâncias como JSON automaticamente.
export class StockPresenter {
  id: string
  productId: string
  quantity: number
  minQuantity: number
  location: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date

  constructor(output: StockOutput) {
    this.id = output.id
    this.productId = output.productId
    this.quantity = output.quantity
    this.minQuantity = output.minQuantity
    this.location = output.location
    this.isActive = output.isActive
    this.createdAt = output.createdAt
    this.updatedAt = output.updatedAt
  }
}

// Classe que formata a resposta de uma listagem de estoques.
// Converte cada item em StockPresenter e inclui os metadados de paginação (quando disponíveis).
export class StockCollectionPresenter {
  items: StockPresenter[]
  total: number
  currentPage?: number
  perPage?: number
  lastPage?: number

  constructor(output: StockCollectionOutput) {
    this.items = output.items.map((item) => new StockPresenter(item))
    this.total = output.total
    this.currentPage = output.currentPage
    this.perPage = output.perPage
    this.lastPage = output.lastPage
  }
}
