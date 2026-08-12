import { Module } from '@nestjs/common'
import { PurchaseOrderController } from './controllers/purchase-order.controller'
import { PrismaService } from '@/shared/infrastructure/database/prisma/prisma.service'
import { PurchaseOrderPrismaRepository } from './database/prisma/purchase-order-prisma.repository'
import { StockPrismaRepository } from '@/stock/infrastructure/database/prisma/stock-prisma.repository'
import {
  CreatePurchaseOrderUseCase,
  GetPurchaseOrderUseCase,
  ListPurchaseOrdersUseCase,
  ReceiveDeliveryUseCase,
  CancelPurchaseOrderUseCase,
} from '@/purchase-orders/application/usecases'
import { PurchaseOrderRepository } from '@/purchase-orders/domain/repositories/purchase-order.repository'
import { StockRepository } from '@/stock/domain/repositories/stock.repository'

@Module({
  controllers: [PurchaseOrderController],
  providers: [
    PrismaService,
    {
      provide: 'PurchaseOrderRepository',
      useFactory: (prisma: PrismaService) =>
        new PurchaseOrderPrismaRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: 'StockRepository',
      useFactory: (prisma: PrismaService) => new StockPrismaRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: CreatePurchaseOrderUseCase.UseCase,
      useFactory: (repo: PurchaseOrderRepository) =>
        new CreatePurchaseOrderUseCase.UseCase(repo),
      inject: ['PurchaseOrderRepository'],
    },
    {
      provide: GetPurchaseOrderUseCase.UseCase,
      useFactory: (repo: PurchaseOrderRepository) =>
        new GetPurchaseOrderUseCase.UseCase(repo),
      inject: ['PurchaseOrderRepository'],
    },
    {
      provide: ListPurchaseOrdersUseCase.UseCase,
      useFactory: (repo: PurchaseOrderRepository) =>
        new ListPurchaseOrdersUseCase.UseCase(repo),
      inject: ['PurchaseOrderRepository'],
    },
    {
      // ReceiveDelivery precisa de ambos os repositórios:
      // PurchaseOrder para buscar/atualizar o pedido, Stock para atualizar o estoque
      provide: ReceiveDeliveryUseCase.UseCase,
      useFactory: (
        purchaseOrderRepo: PurchaseOrderRepository,
        stockRepo: StockRepository,
      ) => new ReceiveDeliveryUseCase.UseCase(purchaseOrderRepo, stockRepo),
      inject: ['PurchaseOrderRepository', 'StockRepository'],
    },
    {
      provide: CancelPurchaseOrderUseCase.UseCase,
      useFactory: (repo: PurchaseOrderRepository) =>
        new CancelPurchaseOrderUseCase.UseCase(repo),
      inject: ['PurchaseOrderRepository'],
    },
  ],
})
export class PurchaseOrderModule {}
