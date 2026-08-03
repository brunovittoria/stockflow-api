import { SearchableRepositoryInterface } from '@/shared/domain/repositories/repository-contracts'
import { StockEntity } from '@/stock/domain/entities/stock.entity'

export interface StockRepository extends SearchableRepositoryInterface<StockEntity> {
  findByProductId(productId: string): Promise<StockEntity[]>
  findByLocation(location: string): Promise<StockEntity[]>
  findByQuantity(quantity: number): Promise<StockEntity[]>
  findByMinQuantity(minQuantity: number): Promise<StockEntity[]>
  findByIsActive(isActive: boolean): Promise<StockEntity[]>
  findByCreatedAt(createdAt: Date): Promise<StockEntity[]>
  findByUpdatedAt(updatedAt: Date): Promise<StockEntity[]>
  findBelowMinQuantity(): Promise<StockEntity[]>
}
