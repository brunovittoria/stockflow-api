import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  Inject,
  UseGuards,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
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
  CreatePurchaseOrderBody,
  PurchaseOrderItemBody,
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
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'

@ApiTags('purchase-orders')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Token JWT ausente ou inválido' })
@ApiExtraModels(PurchaseOrderItemBody)
@Controller('purchase-orders')
@UseGuards(AuthGuard('jwt'))
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
  @ApiOperation({
    summary: 'Criar pedido de compra',
    description:
      'Status inicial: DRAFT. Informe supplierId e pelo menos um item.',
  })
  @ApiBody({ type: CreatePurchaseOrderBody })
  @ApiCreatedResponse({
    description: 'Pedido criado em DRAFT',
    type: PurchaseOrderPresenter,
  })
  async create(
    @Body(new ZodValidationPipe(createPurchaseOrderSchema))
    dto: CreatePurchaseOrderDto,
  ) {
    const output = await this.createUseCase.execute(dto)
    return new PurchaseOrderPresenter(output)
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar pedido por ID',
    description: 'Retorna um pedido. 404 se o ID não existir.',
  })
  @ApiOkResponse({
    description: 'Pedido encontrado',
    type: PurchaseOrderPresenter,
  })
  async findOne(@Param('id') id: string) {
    const output = await this.getUseCase.execute({ id })
    return new PurchaseOrderPresenter(output)
  }

  @Get()
  @ApiOperation({
    summary: 'Listar pedidos',
    description: 'Lista paginada. Query: page, perPage, sort, sortDir, filter.',
  })
  @ApiOkResponse({
    description: 'Lista de pedidos',
    type: PurchaseOrderCollectionPresenter,
  })
  async search(
    @Query(new ZodValidationPipe(listPurchaseOrdersSchema))
    params: ListPurchaseOrdersDto,
  ) {
    const output = await this.listUseCase.execute(params)
    return new PurchaseOrderCollectionPresenter(output)
  }

  // POST :id/receive-delivery — aciona a entrega; retorna o status e os estoques atualizados
  @Post(':id/receive-delivery')
  @ApiOperation({
    summary: 'Confirmar recebimento',
    description:
      'Só funciona com status SENT. Marca DELIVERED e soma as quantidades no estoque.',
  })
  @ApiOkResponse({
    description: 'Entrega confirmada e estoques atualizados',
    type: ReceiveDeliveryPresenter,
  })
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
  @ApiOperation({
    summary: 'Cancelar pedido',
    description:
      'Só DRAFT ou SENT. DELIVERED e CANCELLED não cancelam de novo.',
  })
  @ApiOkResponse({
    description: 'Pedido cancelado',
    type: PurchaseOrderPresenter,
  })
  async cancel(@Param('id') id: string) {
    const output = await this.cancelUseCase.execute({ id })
    return new PurchaseOrderPresenter(output)
  }
}
