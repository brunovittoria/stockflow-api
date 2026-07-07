import { SearchableRepositoryInterface } from '@/shared/domain/repositories/repository-contracts'
import { ProductEntity } from '../entities/product.entity'

export interface ProductRepository extends SearchableRepositoryInterface<ProductEntity> {
  // Métodos específicos de Product (além do CRUD base)
  findBySku(sku: string): Promise<ProductEntity>
  skuExists(sku: string): Promise<boolean>
  findBySupplierId(supplierId: string): Promise<ProductEntity[]>
}
