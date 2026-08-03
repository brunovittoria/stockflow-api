import { SearchableRepositoryInterface } from '@/shared/domain/repositories/repository-contracts'
import { SupplierEntity } from '@/suppliers/domain/entities/supplier.entity'

export interface SupplierRepository extends SearchableRepositoryInterface<SupplierEntity> {
  findByName(name: string): Promise<SupplierEntity[]>
  findByCnpj(cnpj: string): Promise<SupplierEntity[]>
  findByEmail(email: string): Promise<SupplierEntity[]>
  findByPhone(phone: string): Promise<SupplierEntity[]>
  findByIsActive(isActive: boolean): Promise<SupplierEntity[]>
  findByCreatedAt(createdAt: Date): Promise<SupplierEntity[]>
  findByUpdatedAt(updatedAt: Date): Promise<SupplierEntity[]>
  findByCreatedAtAndUpdatedAt(
    createdAt: Date,
    updatedAt: Date,
  ): Promise<SupplierEntity[]>
}
