import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  Inject,
} from '@nestjs/common'
import {
  CreatePurchaseOrderUseCase,
  GetPurchaseOrderUseCase,
  ListPurchaseOrdersUseCase,
  ReceiveDeliveryUseCase,
  CancelPurchaseOrderUseCase,
} from '@/purchase-orders/application/usecases'
import { ZodValidationPipe } from '@/shared/infrastructure/pipes/zod-validation.pipe'
import {
  createPurchaseOrderSchema,
  listPurchaseOrdersSchema,
} from '@/purchase-orders/infrastructure/dto'
import type {
  CreatePurchaseOrderDto,
  ListPurchaseOrdersDto,
} from '@/purchase-orders/infrastructure/dto'
import {
  PurchaseOrderPresenter,
  PurchaseOrderCollectionPresenter,
} from '@/purchase-orders/infrastructure/presenters/purchase-order.presenter'
import { ReceiveDeliveryPresenter } from '@/purchase-orders/infrastructure/presenters/receive-delivery.presenter'

@Controller('purchase-orders')
export class PurchaseOrderController {
  @Inject(CreatePurchaseOrderUseCase.UseCase)
  private createUseCase!: CreatePurchaseOrderUseCase.UseCase

  @Inject(GetPurchaseOrderUseCase.UseCase)
  private getUseCase!: GetPurchaseOrderUseCase.UseCase

  @Inject(ListPurchaseOrdersUseCase.UseCase)
  private listUseCase!: ListPurchaseOrdersUseCase.UseCase

  @Inject(ReceiveDeliveryUseCase.UseCase)
  private receiveDeliveryUseCase!: ReceiveDeliveryUseCase.UseCase

  @Inject(CancelPurchaseOrderUseCase.UseCase)
  private cancelUseCase!: CancelPurchaseOrderUseCase.UseCase

  @Post()
  async create(
    @Body(new ZodValidationPipe(createPurchaseOrderSchema))
    dto: CreatePurchaseOrderDto,
  ) {
    const output = await this.createUseCase.execute(dto)
    return new PurchaseOrderPresenter(output)
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const output = await this.getUseCase.execute({ id })
    return new PurchaseOrderPresenter(output)
  }

  @Get()
  async search(
    @Query(new ZodValidationPipe(listPurchaseOrdersSchema))
    params: ListPurchaseOrdersDto,
  ) {
    const output = await this.listUseCase.execute(params)
    return new PurchaseOrderCollectionPresenter(output)
  }

  // POST :id/receive-delivery — aciona a entrega; retorna o status e os estoques atualizados
  @Post(':id/receive-delivery')
  async receiveDelivery(@Param('id') id: string) {
    // O Input do use case usa purchaseOrderId, não id
    const output = await this.receiveDeliveryUseCase.execute({
      purchaseOrderId: id,
    })
    return new ReceiveDeliveryPresenter(output)
  }

  // POST :id/cancel — cancela o pedido e retorna o estado final
  // Usa POST em vez de DELETE porque não estamos apagando o recurso, apenas mudando o status
  @Post(':id/cancel')
  async cancel(@Param('id') id: string) {
    const output = await this.cancelUseCase.execute({ id })
    return new PurchaseOrderPresenter(output)
  }
}
