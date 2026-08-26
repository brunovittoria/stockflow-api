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
  UseGuards,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import {
  CreateProductUseCase,
  GetProductUseCase,
  ListProductsUseCase,
  UpdateProductUseCase,
  DeleteProductUseCase,
} from '@/products/application/usecases'
import { ZodValidationPipe } from '@/shared/infrastructure/pipes/zod-validation.pipe'
import {
  createProductSchema,
  updateProductSchema,
  listProductsSchema,
  CreateProductBody,
  UpdateProductBody,
} from '@/products/infrastructure/dto'
import type {
  CreateProductDto,
  UpdateProductDto,
  ListProductsDto,
} from '@/products/infrastructure/dto'
import {
  ProductPresenter,
  ProductCollectionPresenter,
} from '@/products/infrastructure/presenters/product.presenter'
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'

@ApiTags('products')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Token JWT ausente ou inválido' })
@Controller('products')
@UseGuards(AuthGuard('jwt'))
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
  @ApiOperation({
    summary: 'Criar produto',
    description:
      'Cria o produto e o estoque inicial (quantity = 0). SKU deve ser único. price deve ser maior que costPrice.',
  })
  @ApiBody({ type: CreateProductBody })
  @ApiCreatedResponse({
    description: 'Produto criado',
    type: ProductPresenter,
  })
  async create(
    @Body(new ZodValidationPipe(createProductSchema)) dto: CreateProductDto,
  ) {
    const output = await this.createUseCase.execute(dto)
    return new ProductPresenter(output)
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar produto por ID',
    description: 'Retorna um produto. 404 se o ID não existir.',
  })
  @ApiOkResponse({ description: 'Produto encontrado', type: ProductPresenter })
  async findOne(@Param('id') id: string) {
    const output = await this.getUseCase.execute({ id })
    return new ProductPresenter(output)
  }

  @Get()
  @ApiOperation({
    summary: 'Listar produtos',
    description: 'Lista paginada. Query: page, perPage, sort, sortDir, filter.',
  })
  @ApiOkResponse({
    description: 'Lista de produtos',
    type: ProductCollectionPresenter,
  })
  async search(
    @Query(new ZodValidationPipe(listProductsSchema)) params: ListProductsDto,
  ) {
    const output = await this.listUseCase.execute(params)
    return new ProductCollectionPresenter(output)
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Atualizar produto',
    description:
      'SKU e supplierId não mudam. Envie só name, description, price, costPrice e category.',
  })
  @ApiBody({ type: UpdateProductBody })
  @ApiOkResponse({ description: 'Produto atualizado', type: ProductPresenter })
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateProductSchema)) dto: UpdateProductDto,
  ) {
    const output = await this.updateUseCase.execute({ id, ...dto })
    return new ProductPresenter(output)
  }

  @HttpCode(204)
  @Delete(':id')
  @ApiOperation({
    summary: 'Remover produto',
    description:
      '204 sem body. Pode falhar se o estoque ainda estiver vinculado (FK).',
  })
  @ApiNoContentResponse({ description: 'Produto removido' })
  async remove(@Param('id') id: string) {
    await this.deleteUseCase.execute({ id })
  }
}
