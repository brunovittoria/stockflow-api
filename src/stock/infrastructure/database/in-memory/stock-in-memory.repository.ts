/* eslint-disable @typescript-eslint/require-await */
import { InMemorySearchableRepository } from '@/shared/domain/repositories/in-memory-searchable.repository'
import { StockEntity } from '@/stock/domain/entities/stock.entity'
import { StockRepository } from '@/stock/domain/repositories/stock.repository'

export class StockInMemoryRepository
  extends InMemorySearchableRepository<StockEntity>
  implements StockRepository
{
  sortableFields: string[] = [
    'productId',
    'quantity',
    'minQuantity',
    'location',
    'isActive',
    'createdAt',
    'updatedAt',
  ]

  async findByProductId(productId: string): Promise<StockEntity[]> {
    return this.items.filter((item) => item.productId === productId)
  }

  async findByQuantity(quantity: number): Promise<StockEntity[]> {
    return this.items.filter((item) => item.quantity === quantity)
  }

  async findByMinQuantity(minQuantity: number): Promise<StockEntity[]> {
    return this.items.filter((item) => item.minQuantity === minQuantity)
  }

  async findByLocation(location: string): Promise<StockEntity[]> {
    return this.items.filter((item) => item.location === location)
  }

  async findByIsActive(isActive: boolean): Promise<StockEntity[]> {
    return this.items.filter((item) => item.isActive === isActive)
  }

  async findByCreatedAt(createdAt: Date): Promise<StockEntity[]> {
    return this.items.filter(
      (item) => item.createdAt.getTime() === createdAt.getTime(),
    )
  }

  async findByUpdatedAt(updatedAt: Date): Promise<StockEntity[]> {
    return this.items.filter(
      (item) => item.updatedAt.getTime() === updatedAt.getTime(),
    )
  }

  async findBelowMinQuantity(): Promise<StockEntity[]> {
    return this.items.filter((item) => item.isCritical)
  }

  protected async applyFilter(
    items: StockEntity[],
    filter: string | null,
  ): Promise<StockEntity[]> {
    if (!filter) return items

    return items.filter((item) =>
      item.location.toLowerCase().includes(filter.toLowerCase()),
    )
  }
}
