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
      useFactory: (repo: StockRepository) => new GetStockUseCase.UseCase(repo),
      inject: ['StockRepository'],
    },
    {
      provide: UpdateStockUseCase.UseCase,
      useFactory: (repo: StockRepository) =>
        new UpdateStockUseCase.UseCase(repo),
      inject: ['StockRepository'],
    },
    {
      provide: ListCriticalStockUseCase.UseCase,
      useFactory: (repo: StockRepository) =>
        new ListCriticalStockUseCase.UseCase(repo),
      inject: ['StockRepository'],
    },
  ],
})
export class StockModule {}
