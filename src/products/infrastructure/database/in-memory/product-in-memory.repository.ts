/* eslint-disable @typescript-eslint/require-await */
import { InMemorySearchableRepository } from '@/shared/domain/repositories/in-memory-searchable.repository'
import { ProductEntity } from '@/products/domain/entities/product.entity'
import { ProductRepository } from '@/products/domain/repositories/product.repository'
import { NotFoundError } from '@/shared/domain/errors/not-found-error'

// extends InMemorySearchableRepository<ProductEntity>
//   → HERANÇA: recebe de graça insert, findById, findAll, update, delete, search
//   → o <ProductEntity> preenche o E genérico — "esta caixa guarda ProductEntity"
//
// implements ProductRepository
//   → CONTRATO: TypeScript garante que todos os métodos da interface estão presentes
//   → se faltar findBySku, skuExists ou findBySupplierId, o compilador avisa
//
// Diferença entre os dois:
//   extends  → herda CÓDIGO (métodos prontos da classe pai)
//   implements → herda apenas a OBRIGAÇÃO (sem código, só a lista de exigências)
export class ProductInMemoryRepository
  extends InMemorySearchableRepository<ProductEntity>
  implements ProductRepository
{
  // Informa ao InMemorySearchableRepository quais campos aceitam ordenação.
  // Se o cliente passar sort='name', a busca ordena por nome.
  // Campos fora desta lista são ignorados na ordenação.
  sortableFields: string[] = ['name', 'price', 'createdAt']

  // Método específico de Product — não existe no repositório base.
  // this.items → array herdado de InMemoryRepository (via extends).
  // Busca o primeiro produto cujo SKU bate; lança NotFoundError se não achar.
  async findBySku(sku: string): Promise<ProductEntity> {
    const entity = this.items.find((item) => item.sku === sku)
    if (!entity) {
      throw new NotFoundError(`Product with SKU ${sku} not found`)
    }
    return entity
  }

  // Retorna true/false — só precisa saber se o SKU já existe (usado no CreateProduct
  // para evitar duplicatas antes de inserir).
  async skuExists(sku: string): Promise<boolean> {
    return this.items.some((item) => item.sku === sku)
  }

  // Um fornecedor pode ter vários produtos — por isso retorna array.
  async findBySupplierId(supplierId: string): Promise<ProductEntity[]> {
    return this.items.filter((item) => item.supplierId === supplierId)
  }

  // Override obrigatório de InMemorySearchableRepository.
  // Define como filtrar produtos na busca paginada (GET /products?filter=camiseta).
  // Sem override, o compilador avisa porque applyFilter é abstract na classe pai.
  protected async applyFilter(
    items: ProductEntity[],
    filter: string | null,
  ): Promise<ProductEntity[]> {
    if (!filter) return items

    // Filtra por nome (case-insensitive)
    return items.filter((item) =>
      item.name.toLowerCase().includes(filter.toLowerCase()),
    )
  }
}
