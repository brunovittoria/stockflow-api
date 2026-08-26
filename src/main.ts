import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { AppModule } from '@/app.module'
import { applyGlobalConfig } from '@/global-config'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  applyGlobalConfig(app)

  const config = new DocumentBuilder()
    .setTitle('StockFlow API')
    .setDescription('Produtos, estoque, fornecedores e pedidos')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('docs', app, document)

  await app.listen(process.env.PORT ?? 3000)
}

void bootstrap()
