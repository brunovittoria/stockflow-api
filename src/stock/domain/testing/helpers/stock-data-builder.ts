import { faker } from '@faker-js/faker'
import { StockProps } from '@/stock/domain/entities/stock.entity'

export function StockDataBuilder(props: Partial<StockProps> = {}): StockProps {
  return {
    productId: props.productId ?? faker.string.uuid(),
    quantity: props.quantity ?? faker.number.int({ min: 1, max: 100 }),
    minQuantity: props.minQuantity ?? faker.number.int({ min: 1, max: 100 }),
    location: props.location ?? faker.location.streetAddress(),
    isActive: props.isActive ?? true,
    createdAt: props.createdAt ?? new Date(),
    updatedAt: props.updatedAt ?? new Date(),
  }
}
