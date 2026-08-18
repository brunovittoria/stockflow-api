import { PrismaService } from '@/shared/infrastructure/database/prisma/prisma.service'
import { PurchaseOrderRepository } from '@/purchase-orders/domain/repositories/purchase-order.repository'
import {
  PurchaseOrderEntity,
  PurchaseOrderItem,
  PurchaseOrderStatus,
} from '@/purchase-orders/domain/entities/purchase-order.entity'
import { PurchaseOrderModelMapper } from './purchase-order-model.mapper'
import { NotFoundError } from '@/shared/domain/errors/not-found-error'
import {
  SearchParams,
  SearchResult,
} from '@/shared/domain/repositories/repository-contracts'

const INCLUDE_ITEMS = { items: true } as const

export class PurchaseOrderPrismaRepository implements PurchaseOrderRepository {
  constructor(private prisma: PrismaService) {}

  async insert(entity: PurchaseOrderEntity): Promise<void> {
    await this.prisma.purchaseOrder.create({
      data: {
        id: entity.id,
        supplierId: entity.supplierId,
        status: entity.status,
        totalCost: entity.totalCost,
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt,
        items: {
          create: entity.items.map((item: PurchaseOrderItem) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitCost: item.unitCost,
          })),
        },
      },
    })
  }

  async findById(id: string): Promise<PurchaseOrderEntity> {
    const model = await this.prisma.purchaseOrder.findUnique({
      where: { id },
      include: INCLUDE_ITEMS,
    })

    if (!model) {
      throw new NotFoundError(`Purchase order with id ${id} not found`)
    }

    return PurchaseOrderModelMapper.toEntity(model)
  }

  async findBySupplierId(supplierId: string): Promise<PurchaseOrderEntity[]> {
    const models = await this.prisma.purchaseOrder.findMany({
      where: { supplierId },
      include: INCLUDE_ITEMS,
    })
    return models.map((model) => PurchaseOrderModelMapper.toEntity(model))
  }

  async findByStatus(
    status: PurchaseOrderStatus,
  ): Promise<PurchaseOrderEntity[]> {
    const models = await this.prisma.purchaseOrder.findMany({
      where: { status },
      include: INCLUDE_ITEMS,
    })
    return models.map((model) => PurchaseOrderModelMapper.toEntity(model))
  }

  async findActiveOrders(supplierId: string): Promise<PurchaseOrderEntity[]> {
    const models = await this.prisma.purchaseOrder.findMany({
      where: { supplierId, status: { notIn: ['CANCELLED', 'DELIVERED'] } },
      include: INCLUDE_ITEMS,
    })
    return models.map((model) => PurchaseOrderModelMapper.toEntity(model))
  }

  async findByProductId(productId: string): Promise<PurchaseOrderEntity[]> {
    const models = await this.prisma.purchaseOrder.findMany({
      where: { items: { some: { productId } } },
      include: INCLUDE_ITEMS,
    })
    return models.map((model) => PurchaseOrderModelMapper.toEntity(model))
  }

  async findAll(): Promise<PurchaseOrderEntity[]> {
    const models = await this.prisma.purchaseOrder.findMany({
      include: INCLUDE_ITEMS,
    })
    return models.map((model) => PurchaseOrderModelMapper.toEntity(model))
  }

  async update(entity: PurchaseOrderEntity): Promise<void> {
    await this.prisma.purchaseOrder.update({
      where: { id: entity.id },
      data: {
        status: entity.status,
        updatedAt: entity.updatedAt,
      },
    })
  }

  async delete(id: string): Promise<void> {
    await this.prisma.purchaseOrderItem.deleteMany({ where: { purchaseOrderId: id } })
    await this.prisma.purchaseOrder.delete({ where: { id } })
  }

  async search(
    params: SearchParams,
  ): Promise<SearchResult<PurchaseOrderEntity>> {
    const { page = 1, perPage = 15, sort, sortDir, filter } = params

    const where = filter ? { status: { equals: filter.toUpperCase() } } : {}

    const [items, total] = await Promise.all([
      this.prisma.purchaseOrder.findMany({
        where,
        include: INCLUDE_ITEMS,
        orderBy: sort ? { [sort]: sortDir ?? 'asc' } : { createdAt: 'desc' },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      this.prisma.purchaseOrder.count({ where }),
    ])

    return {
      items: items.map((model) => PurchaseOrderModelMapper.toEntity(model)),
      total,
      currentPage: page,
      perPage,
      lastPage: Math.ceil(total / perPage),
    }
  }
}
