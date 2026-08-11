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
      // CreateProduct agora depende de ambos os repositórios para criar o estoque inicial
      provide: CreateProductUseCase.UseCase,
      useFactory: (
        productRepo: ProductRepository,
        stockRepo: StockRepository,
      ) => new CreateProductUseCase.UseCase(productRepo, stockRepo),
      inject: ['ProductRepository', 'StockRepository'],
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
