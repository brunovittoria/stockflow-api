import { Module } from '@nestjs/common'
import { AppController } from '@/app.controller'
import { AppService } from '@/app.service'
import { ProductsModule } from '@/products/infrastructure/products.module'
import { SuppliersModule } from '@/suppliers/infrastructure/suppliers.module'
import { StockModule } from '@/stock/infrastructure/stock.module'
import { PurchaseOrderModule } from '@/purchase-orders/infrastructure/purchase-order.module'

@Module({
  imports: [ProductsModule, SuppliersModule, StockModule, PurchaseOrderModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
