import { Controller, Get, Put, Param, Body, Inject } from '@nestjs/common'
import {
  GetStockUseCase,
  UpdateStockUseCase,
  ListCriticalStockUseCase,
} from '@/stock/application/usecases'
import { ZodValidationPipe } from '@/shared/infrastructure/pipes/zod-validation.pipe'
import { updateStockSchema } from '@/stock/infrastructure/dto'
import type { UpdateStockDto } from '@/stock/infrastructure/dto'
import {
  StockPresenter,
  StockCollectionPresenter,
} from '@/stock/infrastructure/presenters/stock.presenter'

@Controller('stocks')
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
  async listCritical() {
    const output = await this.listCriticalUseCase.execute({})
    return new StockCollectionPresenter(output)
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const output = await this.getUseCase.execute({ id })
    return new StockPresenter(output)
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateStockSchema)) dto: UpdateStockDto,
  ) {
    const output = await this.updateUseCase.execute({ id, ...dto })
    return new StockPresenter(output)
  }
}
