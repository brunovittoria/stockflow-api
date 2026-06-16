import { faker } from '@faker-js/faker'
import { SupplierProps } from '@/suppliers/domain/entities/supplier.entity'

export function SupplierDataBuilder(
  props: Partial<SupplierProps> = {},
): SupplierProps {
  return {
    name: props.name ?? faker.company.name(),
    email: props.email ?? faker.internet.email(),
    phone: props.phone ?? faker.phone.number(),
    cnpj: props.cnpj ?? faker.string.numeric(14),
    isActive: props.isActive ?? true,
    createdAt: props.createdAt ?? new Date(),
    updatedAt: props.updatedAt ?? new Date(),
  }
}
