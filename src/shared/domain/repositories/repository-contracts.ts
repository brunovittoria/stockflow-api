export interface RepositoryInterface<E> {
  insert(entity: E): Promise<void>
  findById(id: string): Promise<E>
  findAll(): Promise<E[]>
  update(entity: E): Promise<void>
  delete(id: string): Promise<void>
}

// Para repositórios com busca paginada
export interface SearchParams {
  page?: number
  perPage?: number
  sort?: string | null
  sortDir?: 'asc' | 'desc' | null
  filter?: string | null
}

export interface SearchResult<E> {
  items: E[]
  total: number
  currentPage: number
  perPage: number
  lastPage: number
}

export interface SearchableRepositoryInterface<
  E,
> extends RepositoryInterface<E> {
  search(params: SearchParams): Promise<SearchResult<E>>
}
