import { ApiProperty } from '@nestjs/swagger'

// Contrato de entrada do presenter: define quais campos o use case deve devolver
// para que o presenter consiga montar a resposta. Qualquer use case que retorne
// esses campos pode ser passado para SupplierPresenter — sem acoplamento a um use case específico.
export type SupplierOutput = {
  id: string
  name: string
  cnpj: string
  email: string
  phone: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// Mesmo conceito para listagens: além dos itens, inclui os metadados de paginação
// que o use case de listagem sempre retorna (total de registros, página atual, etc.)
export type SupplierCollectionOutput = {
  items: SupplierOutput[] // lista de suppliers já no formato SupplierOutput
  total: number // total de registros no banco (não só na página)
  currentPage: number // página atual
  perPage: number // quantos itens por página
  lastPage: number // última página disponível
}

// Classe que formata a resposta de um único supplier.
// É uma classe (não um type) porque o NestJS serializa instâncias de classe como JSON automaticamente.
// Os campos declarados aqui são exatamente o que o cliente vai receber na resposta HTTP.
// Se quiser esconder um campo (ex: cnpj), basta removê-lo daqui — sem tocar no use case.
export class SupplierPresenter {
  @ApiProperty()
  id: string
  @ApiProperty()
  name: string
  @ApiProperty()
  cnpj: string
  @ApiProperty()
  email: string
  @ApiProperty()
  phone: string
  @ApiProperty()
  isActive: boolean
  @ApiProperty()
  createdAt: Date
  @ApiProperty()
  updatedAt: Date

  // Recebe o output do use case e copia os campos para as propriedades da classe
  constructor(output: SupplierOutput) {
    this.id = output.id
    this.name = output.name
    this.cnpj = output.cnpj
    this.email = output.email
    this.phone = output.phone
    this.isActive = output.isActive
    this.createdAt = output.createdAt
    this.updatedAt = output.updatedAt
  }
}

// Classe que formata a resposta de uma listagem de suppliers.
// Converte cada item em SupplierPresenter e inclui os metadados de paginação.
export class SupplierCollectionPresenter {
  @ApiProperty({ type: [SupplierPresenter] })
  items: SupplierPresenter[]
  @ApiProperty()
  total: number
  @ApiProperty()
  currentPage: number
  @ApiProperty()
  perPage: number
  @ApiProperty()
  lastPage: number

  constructor(output: SupplierCollectionOutput) {
    this.items = output.items.map((item) => new SupplierPresenter(item))
    this.total = output.total
    this.currentPage = output.currentPage
    this.perPage = output.perPage
    this.lastPage = output.lastPage
  }
}
