import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  Inject,
} from '@nestjs/common'
import { CreateProductUseCase } from '@/products/application/usecases/create-product.usecase'
import { GetProductUseCase } from '@/products/application/usecases/get-product.usecase'
import { ListProductsUseCase } from '@/products/application/usecases/list-products.usecase'
import { UpdateProductUseCase } from '@/products/application/usecases/update-product.usecase'
import { DeleteProductUseCase } from '@/products/application/usecases/delete-product.usecase'
import { ZodValidationPipe } from '@/shared/infrastructure/pipes/zod-validation.pipe'
import { createProductSchema } from '@/products/infrastructure/dto/create-product.dto'
import type { CreateProductDto } from '@/products/infrastructure/dto/create-product.dto'
import { updateProductSchema } from '@/products/infrastructure/dto/update-product.dto'
import type { UpdateProductDto } from '@/products/infrastructure/dto/update-product.dto'
import { listProductsSchema } from '@/products/infrastructure/dto/list-products.dto'
import type { ListProductsDto } from '@/products/infrastructure/dto/list-products.dto'
import {
  ProductPresenter,
  ProductCollectionPresenter,
} from '@/products/infrastructure/presenters/product.presenter'

@Controller('products')
export class ProductsController {
  @Inject(CreateProductUseCase.UseCase)
  private createUseCase!: CreateProductUseCase.UseCase

  @Inject(GetProductUseCase.UseCase)
  private getUseCase!: GetProductUseCase.UseCase

  @Inject(ListProductsUseCase.UseCase)
  private listUseCase!: ListProductsUseCase.UseCase

  @Inject(UpdateProductUseCase.UseCase)
  private updateUseCase!: UpdateProductUseCase.UseCase

  @Inject(DeleteProductUseCase.UseCase)
  private deleteUseCase!: DeleteProductUseCase.UseCase

  @Post()
  async create(
    @Body(new ZodValidationPipe(createProductSchema)) dto: CreateProductDto,
  ) {
    const output = await this.createUseCase.execute(dto)
    return new ProductPresenter(output)
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const output = await this.getUseCase.execute({ id })
    return new ProductPresenter(output)
  }

  @Get()
  async search(
    @Query(new ZodValidationPipe(listProductsSchema)) params: ListProductsDto,
  ) {
    const output = await this.listUseCase.execute(params)
    return new ProductCollectionPresenter(output)
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateProductSchema)) dto: UpdateProductDto,
  ) {
    const output = await this.updateUseCase.execute({ id, ...dto })
    return new ProductPresenter(output)
  }

  @HttpCode(204)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.deleteUseCase.execute({ id })
  }
}
