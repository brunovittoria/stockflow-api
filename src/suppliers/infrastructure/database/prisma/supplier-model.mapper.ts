import { Supplier as SupplierModel } from '@prisma/client'
import { SupplierEntity } from '@/suppliers/domain/entities/supplier.entity'

export class SupplierModelMapper {
  // Prisma Model → Domain Entity
  static toEntity(model: SupplierModel): SupplierEntity {
    return new SupplierEntity(
      {
        name: model.name,
        email: model.email,
        phone: model.phone,
        cnpj: model.cnpj,
        isActive: model.isActive,
        createdAt: model.createdAt,
        updatedAt: model.updatedAt,
      },
      model.id, // passa o ID existente, não gera novo
    )
  }
}
