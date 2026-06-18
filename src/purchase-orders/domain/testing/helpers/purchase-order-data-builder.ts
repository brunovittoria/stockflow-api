import { faker } from '@faker-js/faker'
import {
  PurchaseOrderItem,
  PurchaseOrderProps,
  PurchaseOrderStatus,
} from '@/purchase-orders/domain/entities/purchase-order.entity'

export type PurchaseOrderDataBuilderProps = Omit<
  PurchaseOrderProps,
  'totalCost' | 'status'
> & {
  status?: PurchaseOrderStatus
  totalCost?: number
}

const defaultItems = (): PurchaseOrderItem[] => [
  {
    productId: faker.string.uuid(),
    quantity: 10,
    unitCost: 2500,
  },
  {
    productId: faker.string.uuid(),
    quantity: 5,
    unitCost: 1000,
  },
]

export function PurchaseOrderDataBuilder(
  props: Partial<PurchaseOrderDataBuilderProps> = {},
): PurchaseOrderDataBuilderProps {
  const items = props.items ?? defaultItems()
  const totalCost = items.reduce(
    (sum, item) => sum + item.quantity * item.unitCost,
    0,
  )

  return {
    supplierId: props.supplierId ?? faker.string.uuid(),
    items,
    status: props.status,
    totalCost: props.totalCost ?? totalCost,
    createdAt: props.createdAt ?? new Date(),
    updatedAt: props.updatedAt ?? new Date(),
  }
}
