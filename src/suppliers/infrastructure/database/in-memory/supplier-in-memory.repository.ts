/* eslint-disable @typescript-eslint/require-await */
import { InMemorySearchableRepository } from '@/shared/domain/repositories/in-memory-searchable.repository'
import { SupplierEntity } from '@/suppliers/domain/entities/supplier.entity'
import { SupplierRepository } from '@/suppliers/domain/repositories/supplier.repository'

export class SupplierInMemoryRepository
  extends InMemorySearchableRepository<SupplierEntity>
  implements SupplierRepository
{
  sortableFields: string[] = [
    'name',
    'email',
    'phone',
    'cnpj',
    'isActive',
    'createdAt',
    'updatedAt',
  ]

  async findByName(name: string): Promise<SupplierEntity[]> {
    return this.items.filter((item) => item.name === name)
  }

  async findByCnpj(cnpj: string): Promise<SupplierEntity[]> {
    return this.items.filter((item) => item.cnpj === cnpj)
  }

  async findByEmail(email: string): Promise<SupplierEntity[]> {
    return this.items.filter((item) => item.email === email)
  }

  async findByPhone(phone: string): Promise<SupplierEntity[]> {
    return this.items.filter((item) => item.phone === phone)
  }

  async findByIsActive(isActive: boolean): Promise<SupplierEntity[]> {
    return this.items.filter((item) => item.isActive === isActive)
  }

  async findByCreatedAt(createdAt: Date): Promise<SupplierEntity[]> {
    return this.items.filter((item) => item.createdAt === createdAt)
  }

  async findByUpdatedAt(updatedAt: Date): Promise<SupplierEntity[]> {
    return this.items.filter((item) => item.updatedAt === updatedAt)
  }

  async findByCreatedAtAndUpdatedAt(
    createdAt: Date,
    updatedAt: Date,
  ): Promise<SupplierEntity[]> {
    return this.items.filter(
      (item) => item.createdAt === createdAt && item.updatedAt === updatedAt,
    )
  }

  protected async applyFilter(
    items: SupplierEntity[],
    filter: string | null,
  ): Promise<SupplierEntity[]> {
    if (!filter) return items

    return items.filter((item) =>
      item.name.toLowerCase().includes(filter.toLowerCase()),
    )
  }
}
