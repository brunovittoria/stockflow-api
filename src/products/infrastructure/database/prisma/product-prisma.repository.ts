import { PrismaService } from '@/shared/infrastructure/database/prisma/prisma.service'
import { ProductRepository } from '@/products/domain/repositories/product.repository'
import { ProductEntity } from '@/products/domain/entities/product.entity'
import { ProductModelMapper } from './product-model.mapper'
import { NotFoundError } from '@/shared/domain/errors/not-found-error'
import {
  SearchParams,
  SearchResult,
} from '@/shared/domain/repositories/repository-contracts'

export class ProductPrismaRepository implements ProductRepository {
  constructor(private prisma: PrismaService) {}

  async insert(entity: ProductEntity): Promise<void> {
    await this.prisma.product.create({
      data: {
        id: entity.id,
        name: entity.name,
        description: entity.description,
        sku: entity.sku,
        price: entity.price,
        costPrice: entity.costPrice,
        category: entity.category,
        supplierId: entity.supplierId,
        isActive: entity.isActive,
        createdAt: entity.createdAt,
      },
    })
  }

  async findById(id: string): Promise<ProductEntity> {
    const model = await this.prisma.product.findUnique({
      where: { id },
    })

    if (!model) {
      throw new NotFoundError(`Product with id ${id} not found`)
    }

    return ProductModelMapper.toEntity(model)
  }

  async findBySku(sku: string): Promise<ProductEntity> {
    const model = await this.prisma.product.findUnique({
      where: { sku },
    })

    if (!model) {
      throw new NotFoundError(`Product with SKU ${sku} not found`)
    }

    return ProductModelMapper.toEntity(model)
  }

  async skuExists(sku: string): Promise<boolean> {
    const count = await this.prisma.product.count({
      where: { sku },
    })
    return count > 0
  }

  async findBySupplierId(supplierId: string): Promise<ProductEntity[]> {
    const models = await this.prisma.product.findMany({
      where: { supplierId },
    })
    return models.map((model) => ProductModelMapper.toEntity(model))
  }

  async findAll(): Promise<ProductEntity[]> {
    const models = await this.prisma.product.findMany()
    return models.map((model) => ProductModelMapper.toEntity(model))
  }

  async update(entity: ProductEntity): Promise<void> {
    await this.prisma.product.update({
      where: { id: entity.id },
      data: {
        name: entity.name,
        description: entity.description,
        price: entity.price,
        costPrice: entity.costPrice,
        category: entity.category,
        isActive: entity.isActive,
        updatedAt: entity.updatedAt,
      },
    })
  }

  async delete(id: string): Promise<void> {
    await this.prisma.product.delete({
      where: { id },
    })
  }

  async search(params: SearchParams): Promise<SearchResult<ProductEntity>> {
    const { page = 1, perPage = 15, sort, sortDir, filter } = params

    const where = filter
      ? { name: { contains: filter, mode: 'insensitive' as const } }
      : {}

    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        orderBy: sort ? { [sort]: sortDir ?? 'asc' } : { createdAt: 'desc' },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      this.prisma.product.count({ where }),
    ])

    return {
      items: items.map((model) => ProductModelMapper.toEntity(model)),
      total,
      currentPage: page,
      perPage,
      lastPage: Math.ceil(total / perPage),
    }
  }
}
