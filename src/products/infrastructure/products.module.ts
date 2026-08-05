import { Module } from '@nestjs/common'
import { ProductsController } from './controllers/products.controller'
import { PrismaService } from '@/shared/infrastructure/database/prisma/prisma.service'
import { ProductPrismaRepository } from './database/prisma/product-prisma.repository'
import {
  CreateProductUseCase,
  GetProductUseCase,
  ListProductsUseCase,
  UpdateProductUseCase,
  DeleteProductUseCase,
} from '@/products/application/usecases'
import { ProductRepository } from '@/products/domain/repositories/product.repository'

@Module({
  controllers: [ProductsController],
  providers: [
    PrismaService,
    {
      provide: 'ProductRepository',
      useFactory: (prisma: PrismaService) =>
        new ProductPrismaRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: CreateProductUseCase.UseCase,
      useFactory: (repo: ProductRepository) =>
        new CreateProductUseCase.UseCase(repo),
      inject: ['ProductRepository'],
    },
    {
      provide: GetProductUseCase.UseCase,
      useFactory: (repo: ProductRepository) =>
        new GetProductUseCase.UseCase(repo),
      inject: ['ProductRepository'],
    },
    {
      provide: ListProductsUseCase.UseCase,
      useFactory: (repo: ProductRepository) =>
        new ListProductsUseCase.UseCase(repo),
      inject: ['ProductRepository'],
    },
    {
      provide: UpdateProductUseCase.UseCase,
      useFactory: (repo: ProductRepository) =>
        new UpdateProductUseCase.UseCase(repo),
      inject: ['ProductRepository'],
    },
    {
      provide: DeleteProductUseCase.UseCase,
      useFactory: (repo: ProductRepository) =>
        new DeleteProductUseCase.UseCase(repo),
      inject: ['ProductRepository'],
    },
  ],
})
export class ProductsModule {}
