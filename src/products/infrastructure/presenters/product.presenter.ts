import { ApiProperty } from '@nestjs/swagger'

// Contrato de entrada do presenter: define quais campos o use case deve devolver
// para que o presenter consiga montar a resposta. Qualquer use case que retorne
// esses campos pode ser passado para ProductPresenter — sem acoplamento a um use case específico.
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

// Mesmo conceito para listagens: além dos itens, inclui os metadados de paginação
// que o use case de listagem sempre retorna (total de registros, página atual, etc.)
export type ProductCollectionOutput = {
  items: ProductOutput[] // lista de produtos já no formato ProductOutput
  total: number // total de registros no banco (não só na página)
  currentPage: number // página atual
  perPage: number // quantos itens por página
  lastPage: number // última página disponível
}

// Classe que formata a resposta de um único produto.
// É uma classe (não um type) porque o NestJS serializa instâncias de classe como JSON automaticamente.
// Os campos declarados aqui são exatamente o que o cliente vai receber na resposta HTTP.
// Se quiser esconder um campo (ex: costPrice), basta removê-lo daqui — sem tocar no use case.
export class ProductPresenter {
  @ApiProperty()
  id: string
  @ApiProperty()
  name: string
  @ApiProperty()
  description: string
  @ApiProperty()
  sku: string
  @ApiProperty()
  price: number
  @ApiProperty()
  costPrice: number
  @ApiProperty()
  category: string
  @ApiProperty()
  supplierId: string
  @ApiProperty()
  isActive: boolean
  @ApiProperty()
  createdAt: Date
  @ApiProperty()
  updatedAt: Date

  // Recebe o output do use case e copia os campos para as propriedades da classe
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

// Classe que formata a resposta de uma listagem de produtos.
// Converte cada item em ProductPresenter e inclui os metadados de paginação.
export class ProductCollectionPresenter {
  @ApiProperty({ type: [ProductPresenter] })
  items: ProductPresenter[]
  @ApiProperty()
  total: number
  @ApiProperty()
  currentPage: number
  @ApiProperty()
  perPage: number
  @ApiProperty()
  lastPage: number

  constructor(output: ProductCollectionOutput) {
    this.items = output.items.map((item) => new ProductPresenter(item))
    this.total = output.total
    this.currentPage = output.currentPage
    this.perPage = output.perPage
    this.lastPage = output.lastPage
  }
}
