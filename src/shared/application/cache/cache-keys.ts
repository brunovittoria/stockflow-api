import { SearchParams } from '@/shared/domain/repositories/repository-contracts'

export const CacheTtl = {
  product: 300,
  productsList: 60,
  stock: 60,
  stocksCritical: 30,
} as const

export const CachePrefix = {
  productsList: 'products:list:',
} as const

export const CacheKeys = {
  product: (id: string) => `product:${id}`,

  productsList: (params: SearchParams) => {
    const normalized = {
      page: params.page ?? 1,
      perPage: params.perPage ?? 15,
      sort: params.sort ?? null,
      sortDir: params.sortDir ?? null,
      filter: params.filter ?? null,
    }
    return `${CachePrefix.productsList}${JSON.stringify(normalized)}`
  },

  stock: (id: string) => `stock:${id}`,

  stocksCritical: () => 'stocks:critical',
}
