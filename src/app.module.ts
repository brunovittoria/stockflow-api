import { Module } from '@nestjs/common'
import { AppController } from '@/app.controller'
import { AppService } from '@/app.service'
import { AuthModule } from '@/auth/infrastructure/auth.module'
import { ProductsModule } from '@/products/infrastructure/products.module'
import { SuppliersModule } from '@/suppliers/infrastructure/suppliers.module'
import { StockModule } from '@/stock/infrastructure/stock.module'
import { PurchaseOrderModule } from '@/purchase-orders/infrastructure/purchase-order.module'
import { RedisModule } from '@/shared/infrastructure/cache/redis.module'

@Module({
  imports: [
    RedisModule,
    AuthModule,
    ProductsModule,
    SuppliersModule,
    StockModule,
    PurchaseOrderModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
