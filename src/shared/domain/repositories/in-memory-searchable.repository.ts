import { Entity } from '@/shared/domain/entities/entity'
import {
  SearchableRepositoryInterface,
  SearchParams,
  SearchResult,
} from './repository-contracts'
import { InMemoryRepository } from './in-memory.repository'

export abstract class InMemorySearchableRepository<E extends Entity<any>>
  extends InMemoryRepository<E>
  implements SearchableRepositoryInterface<E>
{
  abstract sortableFields: string[]

  async search(params: SearchParams): Promise<SearchResult<E>> {
    const { page = 1, perPage = 15, sort, sortDir, filter } = params

    const filtered = await this.applyFilter(this.items, filter ?? null)
    const sorted = this.applySort(filtered, sort ?? null, sortDir ?? null)
    const paginated = this.applyPaginate(sorted, page, perPage)

    return {
      items: paginated,
      total: filtered.length,
      currentPage: page,
      perPage,
      lastPage: Math.ceil(filtered.length / perPage),
    }
  }

  protected abstract applyFilter(
    items: E[],
    filter: string | null,
  ): Promise<E[]>

  protected applySort(
    items: E[],
    sort: string | null,
    sortDir: string | null,
  ): E[] {
    if (!sort || !this.sortableFields.includes(sort)) return items

    return [...items].sort((a, b) => {
      const aVal = (a as any).props[sort] ?? (a as any)[sort]
      const bVal = (b as any).props[sort] ?? (b as any)[sort]

      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1
      return 0
    })
  }

  protected applyPaginate(items: E[], page: number, perPage: number): E[] {
    const start = (page - 1) * perPage
    return items.slice(start, start + perPage)
  }
}
