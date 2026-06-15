import { faker } from '@faker-js/faker'
import { ProductProps } from '@/products/domain/entities/product.entity'

export function ProductDataBuilder(props: Partial<ProductProps> = {}): ProductProps {
  return {
    name: props.name ?? faker.commerce.productName(),
    description: props.description ?? faker.commerce.productDescription(),
    sku: props.sku ?? faker.string.alphanumeric(8).toUpperCase(),
    price: props.price ?? faker.number.int({ min: 1000, max: 99900 }),
    costPrice: props.costPrice ?? faker.number.int({ min: 500, max: 49900 }),
    category: props.category ?? faker.commerce.department(),
    supplierId: props.supplierId ?? faker.string.uuid(),
    isActive: props.isActive ?? true,
    createdAt: props.createdAt ?? new Date(),
    updatedAt: props.updatedAt ?? new Date(),
  }
}