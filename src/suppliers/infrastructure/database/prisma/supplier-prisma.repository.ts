import { PrismaService } from '@/shared/infrastructure/database/prisma/prisma.service'
import { SupplierRepository } from '@/suppliers/domain/repositories/supplier.repository'
import { SupplierEntity } from '@/suppliers/domain/entities/supplier.entity'
import { SupplierModelMapper } from './supplier-model.mapper'
import { NotFoundError } from '@/shared/domain/errors/not-found-error'
import {
  SearchParams,
  SearchResult,
} from '@/shared/domain/repositories/repository-contracts'

export class SupplierPrismaRepository implements SupplierRepository {
  constructor(private prisma: PrismaService) {}

  async insert(entity: SupplierEntity): Promise<void> {
    await this.prisma.supplier.create({
      data: {
        id: entity.id,
        name: entity.name,
        email: entity.email,
        phone: entity.phone,
        cnpj: entity.cnpj,
        isActive: entity.isActive,
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt,
      },
    })
  }

  async findById(id: string): Promise<SupplierEntity> {
    const model = await this.prisma.supplier.findUnique({
      where: { id },
    })

    if (!model) {
      throw new NotFoundError(`Supplier with id ${id} not found`)
    }

    return SupplierModelMapper.toEntity(model)
  }

  async findByName(name: string): Promise<SupplierEntity[]> {
    const models = await this.prisma.supplier.findMany({
      where: { name: { contains: name, mode: 'insensitive' } },
    })

    return models.map((model) => SupplierModelMapper.toEntity(model))
  }

  async findByCnpj(cnpj: string): Promise<SupplierEntity[]> {
    const model = await this.prisma.supplier.findUnique({
      where: { cnpj },
    })
    return model ? [SupplierModelMapper.toEntity(model)] : []
  }

  async findByEmail(email: string): Promise<SupplierEntity[]> {
    const models = await this.prisma.supplier.findMany({
      where: { email },
    })
    return models.map((model) => SupplierModelMapper.toEntity(model))
  }

  async findByPhone(phone: string): Promise<SupplierEntity[]> {
    const models = await this.prisma.supplier.findMany({
      where: { phone },
    })
    return models.map((model) => SupplierModelMapper.toEntity(model))
  }

  async findByIsActive(isActive: boolean): Promise<SupplierEntity[]> {
    const models = await this.prisma.supplier.findMany({
      where: { isActive },
    })
    return models.map((model) => SupplierModelMapper.toEntity(model))
  }

  async findByCreatedAt(createdAt: Date): Promise<SupplierEntity[]> {
    const models = await this.prisma.supplier.findMany({
      where: { createdAt },
    })
    return models.map((model) => SupplierModelMapper.toEntity(model))
  }

  async findByUpdatedAt(updatedAt: Date): Promise<SupplierEntity[]> {
    const models = await this.prisma.supplier.findMany({
      where: { updatedAt },
    })
    return models.map((model) => SupplierModelMapper.toEntity(model))
  }

  async findByCreatedAtAndUpdatedAt(
    createdAt: Date,
    updatedAt: Date,
  ): Promise<SupplierEntity[]> {
    const models = await this.prisma.supplier.findMany({
      where: { createdAt, updatedAt },
    })
    return models.map((model) => SupplierModelMapper.toEntity(model))
  }

  async findAll(): Promise<SupplierEntity[]> {
    const models = await this.prisma.supplier.findMany()
    return models.map((model) => SupplierModelMapper.toEntity(model))
  }

  async update(entity: SupplierEntity): Promise<void> {
    await this.prisma.supplier.update({
      where: { id: entity.id },
      data: {
        name: entity.name,
        email: entity.email,
        phone: entity.phone,
        isActive: entity.isActive,
        updatedAt: entity.updatedAt,
      },
    })
  }

  async delete(id: string): Promise<void> {
    await this.prisma.supplier.delete({
      where: { id },
    })
  }

  async search(params: SearchParams): Promise<SearchResult<SupplierEntity>> {
    const { page = 1, perPage = 15, sort, sortDir, filter } = params

    const where = filter
      ? { name: { contains: filter, mode: 'insensitive' as const } }
      : {}

    const [items, total] = await Promise.all([
      this.prisma.supplier.findMany({
        where,
        orderBy: sort ? { [sort]: sortDir ?? 'asc' } : { createdAt: 'desc' },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      this.prisma.supplier.count({ where }),
    ])

    return {
      items: items.map((model) => SupplierModelMapper.toEntity(model)),
      total,
      currentPage: page,
      perPage,
      lastPage: Math.ceil(total / perPage),
    }
  }
}
