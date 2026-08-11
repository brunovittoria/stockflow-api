import { Module } from '@nestjs/common'
import { AppController } from '@/app.controller'
import { AppService } from '@/app.service'
import { ProductsModule } from '@/products/infrastructure/products.module'
import { SuppliersModule } from '@/suppliers/infrastructure/suppliers.module'

@Module({
  imports: [ProductsModule, SuppliersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
