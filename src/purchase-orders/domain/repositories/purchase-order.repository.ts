import { SearchableRepositoryInterface } from '@/shared/domain/repositories/repository-contracts'
import {
  PurchaseOrderEntity,
  PurchaseOrderStatus,
} from '@/purchase-orders/domain/entities/purchase-order.entity'

export interface PurchaseOrderRepository extends SearchableRepositoryInterface<PurchaseOrderEntity> {
  // Busca todos os pedidos de um fornecedor específico
  findBySupplierId(supplierId: string): Promise<PurchaseOrderEntity[]>

  // Busca pedidos filtrando por status (DRAFT, SENT, DELIVERED, CANCELLED)
  findByStatus(status: PurchaseOrderStatus): Promise<PurchaseOrderEntity[]>

  // Busca pedidos que ainda estão ativos (não entregues nem cancelados)
  // Usado para validar: "não pode deletar fornecedor com pedidos ativos"
  findActiveOrders(supplierId: string): Promise<PurchaseOrderEntity[]>

  // Busca pedidos que contêm um produto específico (percorre items[])
  findByProductId(productId: string): Promise<PurchaseOrderEntity[]>
}
