import { Stock as StockModel } from '@prisma/client'
import { StockEntity } from '@/stock/domain/entities/stock.entity'

export class StockModelMapper {
  // Prisma Model → Domain Entity
  static toEntity(model: StockModel): StockEntity {
    return new StockEntity(
      {
        productId: model.productId,
        quantity: model.quantity,
        minQuantity: model.minQuantity,
        location: model.location,
        isActive: model.isActive,
        createdAt: model.createdAt,
        updatedAt: model.updatedAt,
      },
      model.id, // passa o ID existente, não gera novo
    )
  }
}
