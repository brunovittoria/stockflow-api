/* eslint-disable @typescript-eslint/require-await */
import { Entity } from '@/shared/domain/entities/entity'
import { RepositoryInterface } from '@/shared/domain/repositories/repository-contracts'
import { NotFoundError } from '@/shared/domain/errors/not-found-error'

export abstract class InMemoryRepository<
  E extends Entity<any>,
> implements RepositoryInterface<E> {
  items: E[] = []

  async insert(entity: E): Promise<void> {
    this.items.push(entity)
  }

  async findById(id: string): Promise<E> {
    const entity = this.items.find((item) => item.id === id)
    if (!entity) {
      throw new NotFoundError(`Entity with id ${id} not found`)
    }
    return entity
  }

  async findAll(): Promise<E[]> {
    return this.items
  }

  async update(entity: E): Promise<void> {
    const index = this.items.findIndex((item) => item.id === entity.id)
    if (index === -1) {
      throw new NotFoundError(`Entity with id ${entity.id} not found`)
    }
    this.items[index] = entity
  }

  async delete(id: string): Promise<void> {
    const index = this.items.findIndex((item) => item.id === id)
    if (index === -1) {
      throw new NotFoundError(`Entity with id ${id} not found`)
    }
    this.items.splice(index, 1)
  }
}
