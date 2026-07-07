/* eslint-disable @typescript-eslint/require-await */
import { InMemorySearchableRepository } from '@/shared/domain/repositories/in-memory-searchable.repository'
import {
  PurchaseOrderEntity,
  PurchaseOrderStatus,
} from '@/purchase-orders/domain/entities/purchase-order.entity'
import { PurchaseOrderRepository } from '@/purchase-orders/domain/repositories/purchase-order.repository'

export class PurchaseOrderInMemoryRepository
  extends InMemorySearchableRepository<PurchaseOrderEntity>
  implements PurchaseOrderRepository
{
  sortableFields: string[] = ['status', 'totalCost', 'createdAt']

  async findBySupplierId(supplierId: string): Promise<PurchaseOrderEntity[]> {
    return this.items.filter((item) => item.supplierId === supplierId)
  }

  async findByStatus(
    status: PurchaseOrderStatus,
  ): Promise<PurchaseOrderEntity[]> {
    return this.items.filter((item) => item.status === status)
  }

  // Pedidos ativos = DRAFT ou SENT (ainda não concluídos nem cancelados)
  async findActiveOrders(supplierId: string): Promise<PurchaseOrderEntity[]> {
    return this.items.filter(
      (item) =>
        item.supplierId === supplierId &&
        item.status !== 'DELIVERED' &&
        item.status !== 'CANCELLED',
    )
  }

  // Percorre items[] de cada pedido procurando o productId
  async findByProductId(productId: string): Promise<PurchaseOrderEntity[]> {
    return this.items.filter((order) =>
      order.items.some((item) => item.productId === productId),
    )
  }

  // Define como filtrar na busca paginada (GET /purchase-orders?filter=...)
  // Filtra pelo supplierId (busca textual simples)
  protected async applyFilter(
    items: PurchaseOrderEntity[],
    filter: string | null,
  ): Promise<PurchaseOrderEntity[]> {
    if (!filter) return items

    return items.filter((item) =>
      item.supplierId.toLowerCase().includes(filter.toLowerCase()),
    )
  }
}
