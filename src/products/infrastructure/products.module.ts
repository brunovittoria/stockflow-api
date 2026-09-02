import { Module } from '@nestjs/common'
import { ProductsController } from './controllers/products.controller'
import { PrismaService } from '@/shared/infrastructure/database/prisma/prisma.service'
import { ProductPrismaRepository } from './database/prisma/product-prisma.repository'
import { StockPrismaRepository } from '@/stock/infrastructure/database/prisma/stock-prisma.repository'
import {
  CreateProductUseCase,
  GetProductUseCase,
  ListProductsUseCase,
  UpdateProductUseCase,
  DeleteProductUseCase,
} from '@/products/application/usecases'
import { ProductRepository } from '@/products/domain/repositories/product.repository'
import { StockRepository } from '@/stock/domain/repositories/stock.repository'
import {
  CACHE_PROVIDER,
  CacheProvider,
} from '@/shared/application/cache/cache-provider'

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
      provide: 'StockRepository',
      useFactory: (prisma: PrismaService) => new StockPrismaRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: CreateProductUseCase.UseCase,
      useFactory: (
        productRepo: ProductRepository,
        stockRepo: StockRepository,
        cache: CacheProvider,
      ) => new CreateProductUseCase.UseCase(productRepo, stockRepo, cache),
      inject: ['ProductRepository', 'StockRepository', CACHE_PROVIDER],
    },
    {
      provide: GetProductUseCase.UseCase,
      useFactory: (repo: ProductRepository, cache: CacheProvider) =>
        new GetProductUseCase.UseCase(repo, cache),
      inject: ['ProductRepository', CACHE_PROVIDER],
    },
    {
      provide: ListProductsUseCase.UseCase,
      useFactory: (repo: ProductRepository, cache: CacheProvider) =>
        new ListProductsUseCase.UseCase(repo, cache),
      inject: ['ProductRepository', CACHE_PROVIDER],
    },
    {
      provide: UpdateProductUseCase.UseCase,
      useFactory: (repo: ProductRepository, cache: CacheProvider) =>
        new UpdateProductUseCase.UseCase(repo, cache),
      inject: ['ProductRepository', CACHE_PROVIDER],
    },
    {
      provide: DeleteProductUseCase.UseCase,
      useFactory: (repo: ProductRepository, cache: CacheProvider) =>
        new DeleteProductUseCase.UseCase(repo, cache),
      inject: ['ProductRepository', CACHE_PROVIDER],
    },
  ],
})
export class ProductsModule {}
