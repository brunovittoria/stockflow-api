import {
  Controller,
  Get,
  Put,
  Param,
  Body,
  Inject,
  UseGuards,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import {
  GetStockUseCase,
  UpdateStockUseCase,
  ListCriticalStockUseCase,
} from '@/stock/application/usecases'
import { ZodValidationPipe } from '@/shared/infrastructure/pipes/zod-validation.pipe'
import { updateStockSchema, UpdateStockBody } from '@/stock/infrastructure/dto'
import type { UpdateStockDto } from '@/stock/infrastructure/dto'
import {
  StockPresenter,
  StockCollectionPresenter,
} from '@/stock/infrastructure/presenters/stock.presenter'
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'

@ApiTags('stocks')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Token JWT ausente ou inválido' })
@Controller('stocks')
@UseGuards(AuthGuard('jwt'))
export class StocksController {
  @Inject(GetStockUseCase.UseCase)
  private getUseCase!: GetStockUseCase.UseCase

  @Inject(UpdateStockUseCase.UseCase)
  private updateUseCase!: UpdateStockUseCase.UseCase

  @Inject(ListCriticalStockUseCase.UseCase)
  private listCriticalUseCase!: ListCriticalStockUseCase.UseCase

  // GET /stocks/critical — deve vir ANTES de GET /stocks/:id
  // caso contrário, o NestJS interpretaria "critical" como um :id
  @Get('critical')
  @ApiOperation({
    summary: 'Listar estoques críticos',
    description:
      'Itens com quantity menor que minQuantity. Não existe POST /stocks — o estoque nasce no POST /products.',
  })
  @ApiOkResponse({
    description: 'Estoques abaixo do mínimo',
    type: StockCollectionPresenter,
  })
  async listCritical() {
    const output = await this.listCriticalUseCase.execute({})
    return new StockCollectionPresenter(output)
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar estoque por ID',
    description: 'Retorna um estoque. 404 se o ID não existir.',
  })
  @ApiOkResponse({ description: 'Estoque encontrado', type: StockPresenter })
  async findOne(@Param('id') id: string) {
    const output = await this.getUseCase.execute({ id })
    return new StockPresenter(output)
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Atualizar estoque',
    description:
      'productId não muda. Envie quantity, minQuantity, location e isActive.',
  })
  @ApiBody({ type: UpdateStockBody })
  @ApiOkResponse({ description: 'Estoque atualizado', type: StockPresenter })
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateStockSchema)) dto: UpdateStockDto,
  ) {
    const output = await this.updateUseCase.execute({ id, ...dto })
    return new StockPresenter(output)
  }
}
