import { Prisma } from '@prisma/client'
import {
  PurchaseOrderEntity,
  PurchaseOrderStatus,
} from '@/purchase-orders/domain/entities/purchase-order.entity'

type PurchaseOrderWithItems = Prisma.PurchaseOrderGetPayload<{
  include: { items: true }
}>

export class PurchaseOrderModelMapper {
  static toEntity(model: PurchaseOrderWithItems): PurchaseOrderEntity {
    return new PurchaseOrderEntity(
      {
        supplierId: model.supplierId,
        items: model.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitCost: item.unitCost,
        })),
        status: model.status as PurchaseOrderStatus,
        totalCost: model.totalCost,
        createdAt: model.createdAt,
        updatedAt: model.updatedAt,
      },
      model.id,
    )
  }
}
