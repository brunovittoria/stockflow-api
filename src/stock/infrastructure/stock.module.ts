import { Module } from '@nestjs/common'
import { StocksController } from './controllers/stocks.controller'
import { PrismaService } from '@/shared/infrastructure/database/prisma/prisma.service'
import { StockPrismaRepository } from './database/prisma/stock-prisma.repository'
import {
  GetStockUseCase,
  UpdateStockUseCase,
  ListCriticalStockUseCase,
} from '@/stock/application/usecases'
import { StockRepository } from '@/stock/domain/repositories/stock.repository'
import {
  CACHE_PROVIDER,
  CacheProvider,
} from '@/shared/application/cache/cache-provider'

@Module({
  controllers: [StocksController],
  providers: [
    PrismaService,
    {
      provide: 'StockRepository',
      useFactory: (prisma: PrismaService) => new StockPrismaRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: GetStockUseCase.UseCase,
      useFactory: (repo: StockRepository, cache: CacheProvider) =>
        new GetStockUseCase.UseCase(repo, cache),
      inject: ['StockRepository', CACHE_PROVIDER],
    },
    {
      provide: UpdateStockUseCase.UseCase,
      useFactory: (repo: StockRepository, cache: CacheProvider) =>
        new UpdateStockUseCase.UseCase(repo, cache),
      inject: ['StockRepository', CACHE_PROVIDER],
    },
    {
      provide: ListCriticalStockUseCase.UseCase,
      useFactory: (repo: StockRepository, cache: CacheProvider) =>
        new ListCriticalStockUseCase.UseCase(repo, cache),
      inject: ['StockRepository', CACHE_PROVIDER],
    },
  ],
})
export class StockModule {}
