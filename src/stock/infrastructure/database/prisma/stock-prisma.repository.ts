import { PrismaService } from '@/shared/infrastructure/database/prisma/prisma.service'
import { StockRepository } from '@/stock/domain/repositories/stock.repository'
import { StockEntity } from '@/stock/domain/entities/stock.entity'
import { StockModelMapper } from './stock-model.mapper'
import { NotFoundError } from '@/shared/domain/errors/not-found-error'
import {
  SearchParams,
  SearchResult,
} from '@/shared/domain/repositories/repository-contracts'

export class StockPrismaRepository implements StockRepository {
  constructor(private prisma: PrismaService) {}

  async insert(entity: StockEntity): Promise<void> {
    await this.prisma.stock.create({
      data: {
        id: entity.id,
        productId: entity.productId,
        quantity: entity.quantity,
        minQuantity: entity.minQuantity,
        location: entity.location,
        isActive: entity.isActive,
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt,
      },
    })
  }

  async findById(id: string): Promise<StockEntity> {
    const model = await this.prisma.stock.findUnique({
      where: { id },
    })

    if (!model) {
      throw new NotFoundError(`Stock with id ${id} not found`)
    }

    return StockModelMapper.toEntity(model)
  }

  async findAll(): Promise<StockEntity[]> {
    const models = await this.prisma.stock.findMany()
    return models.map((model) => StockModelMapper.toEntity(model))
  }

  async findByProductId(productId: string): Promise<StockEntity[]> {
    const models = await this.prisma.stock.findMany({
      where: { productId },
    })
    return models.map((model) => StockModelMapper.toEntity(model))
  }

  async findByLocation(location: string): Promise<StockEntity[]> {
    const models = await this.prisma.stock.findMany({
      where: { location },
    })
    return models.map((model) => StockModelMapper.toEntity(model))
  }

  async findByQuantity(quantity: number): Promise<StockEntity[]> {
    const models = await this.prisma.stock.findMany({
      where: { quantity },
    })
    return models.map((model) => StockModelMapper.toEntity(model))
  }

  async findByMinQuantity(minQuantity: number): Promise<StockEntity[]> {
    const models = await this.prisma.stock.findMany({
      where: { minQuantity },
    })
    return models.map((model) => StockModelMapper.toEntity(model))
  }

  async findByIsActive(isActive: boolean): Promise<StockEntity[]> {
    const models = await this.prisma.stock.findMany({
      where: { isActive },
    })
    return models.map((model) => StockModelMapper.toEntity(model))
  }

  async findByCreatedAt(createdAt: Date): Promise<StockEntity[]> {
    const models = await this.prisma.stock.findMany({
      where: { createdAt },
    })
    return models.map((model) => StockModelMapper.toEntity(model))
  }

  async findByUpdatedAt(updatedAt: Date): Promise<StockEntity[]> {
    const models = await this.prisma.stock.findMany({
      where: { updatedAt },
    })
    return models.map((model) => StockModelMapper.toEntity(model))
  }

  async findBelowMinQuantity(): Promise<StockEntity[]> {
    const models = await this.prisma.stock.findMany({
      where: {
        quantity: { lt: this.prisma.stock.fields.minQuantity },
      },
    })
    return models.map((model) => StockModelMapper.toEntity(model))
  }

  async update(entity: StockEntity): Promise<void> {
    await this.prisma.stock.update({
      where: { id: entity.id },
      data: {
        quantity: entity.quantity,
        minQuantity: entity.minQuantity,
        location: entity.location,
        isActive: entity.isActive,
        updatedAt: entity.updatedAt,
      },
    })
  }

  async delete(id: string): Promise<void> {
    await this.prisma.stock.delete({
      where: { id },
    })
  }

  async search(params: SearchParams): Promise<SearchResult<StockEntity>> {
    const { page = 1, perPage = 15, sort, sortDir, filter } = params

    const where = filter
      ? { location: { contains: filter, mode: 'insensitive' as const } }
      : {}

    const [items, total] = await Promise.all([
      this.prisma.stock.findMany({
        where,
        orderBy: sort ? { [sort]: sortDir ?? 'asc' } : { createdAt: 'desc' },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      this.prisma.stock.count({ where }),
    ])

    return {
      items: items.map((model) => StockModelMapper.toEntity(model)),
      total,
      currentPage: page,
      perPage,
      lastPage: Math.ceil(total / perPage),
    }
  }
}
