import type { PurchaseOrderStatus } from '@/purchase-orders/domain/entities/purchase-order.entity'

// Contrato de entrada específico para o resultado de receive-delivery.
// É diferente de PurchaseOrderOutput porque não retorna o pedido completo —
// apenas o que mudou: o novo status e quais estoques foram atualizados.
export type ReceiveDeliveryOutput = {
  id: string
  status: PurchaseOrderStatus
  updatedStockItems: Array<{ productId: string; newQuantity: number }>
}

// Presenter para a resposta de POST /purchase-orders/:id/receive-delivery.
export class ReceiveDeliveryPresenter {
  id: string
  status: PurchaseOrderStatus
  updatedStockItems: Array<{ productId: string; newQuantity: number }>

  constructor(output: ReceiveDeliveryOutput) {
    this.id = output.id
    this.status = output.status
    this.updatedStockItems = output.updatedStockItems
  }
}
