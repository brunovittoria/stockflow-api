import { Product as ProductModel } from '@prisma/client'
import { ProductEntity } from '@/products/domain/entities/product.entity'

export class ProductModelMapper {
  // Prisma Model → Domain Entity
  static toEntity(model: ProductModel): ProductEntity {
    return new ProductEntity(
      {
        name: model.name,
        description: model.description ?? '',
        sku: model.sku,
        price: model.price,
        costPrice: model.costPrice,
        category: model.category,
        supplierId: model.supplierId,
        isActive: model.isActive,
        createdAt: model.createdAt,
        updatedAt: model.updatedAt,
      },
      model.id, // passa o ID existente, não gera novo
    )
  }
}
