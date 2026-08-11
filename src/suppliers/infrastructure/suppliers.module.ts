import { Module } from '@nestjs/common'
import { SuppliersController } from './controllers/suppliers.controller'
import { PrismaService } from '@/shared/infrastructure/database/prisma/prisma.service'
import { SupplierPrismaRepository } from './database/prisma/supplier-prisma.repository'
import {
  CreateSupplierUseCase,
  GetSupplierUseCase,
  UpdateSupplierUseCase,
  ListSuppliersUseCase,
  DeleteSupplierUseCase,
} from '@/suppliers/application/usecases'
import { SupplierRepository } from '@/suppliers/domain/repositories/supplier.repository'

@Module({
  controllers: [SuppliersController],
  providers: [
    PrismaService,
    {
      provide: 'SupplierRepository',
      useFactory: (prisma: PrismaService) =>
        new SupplierPrismaRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: CreateSupplierUseCase.UseCase,
      useFactory: (repo: SupplierRepository) =>
        new CreateSupplierUseCase.UseCase(repo),
      inject: ['SupplierRepository'],
    },
    {
      provide: GetSupplierUseCase.UseCase,
      useFactory: (repo: SupplierRepository) =>
        new GetSupplierUseCase.UseCase(repo),
      inject: ['SupplierRepository'],
    },
    {
      provide: UpdateSupplierUseCase.UseCase,
      useFactory: (repo: SupplierRepository) =>
        new UpdateSupplierUseCase.UseCase(repo),
      inject: ['SupplierRepository'],
    },
    {
      provide: ListSuppliersUseCase.UseCase,
      useFactory: (repo: SupplierRepository) =>
        new ListSuppliersUseCase.UseCase(repo),
      inject: ['SupplierRepository'],
    },
    {
      provide: DeleteSupplierUseCase.UseCase,
      useFactory: (repo: SupplierRepository) =>
        new DeleteSupplierUseCase.UseCase(repo),
      inject: ['SupplierRepository'],
    },
  ],
})
export class SuppliersModule {}
