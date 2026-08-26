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
  CreateSupplierUseCase,
  GetSupplierUseCase,
  UpdateSupplierUseCase,
  ListSuppliersUseCase,
  DeleteSupplierUseCase,
} from '@/suppliers/application/usecases'
import { ZodValidationPipe } from '@/shared/infrastructure/pipes/zod-validation.pipe'
import {
  createSupplierSchema,
  updateSupplierSchema,
  listSuppliersSchema,
  CreateSupplierBody,
  UpdateSupplierBody,
} from '@/suppliers/infrastructure/dto'
import type {
  CreateSupplierDto,
  UpdateSupplierDto,
  ListSuppliersDto,
} from '@/suppliers/infrastructure/dto'
import {
  SupplierPresenter,
  SupplierCollectionPresenter,
} from '@/suppliers/infrastructure/presenters/supplier.presenter'
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

@ApiTags('suppliers')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Token JWT ausente ou inválido' })
@Controller('suppliers')
@UseGuards(AuthGuard('jwt'))
export class SuppliersController {
  @Inject(CreateSupplierUseCase.UseCase)
  private createUseCase!: CreateSupplierUseCase.UseCase

  @Inject(GetSupplierUseCase.UseCase)
  private getUseCase!: GetSupplierUseCase.UseCase

  @Inject(UpdateSupplierUseCase.UseCase)
  private updateUseCase!: UpdateSupplierUseCase.UseCase

  @Inject(ListSuppliersUseCase.UseCase)
  private listUseCase!: ListSuppliersUseCase.UseCase

  @Inject(DeleteSupplierUseCase.UseCase)
  private deleteUseCase!: DeleteSupplierUseCase.UseCase

  @Post()
  @ApiOperation({
    summary: 'Criar fornecedor',
    description: 'CNPJ deve ter 14 dígitos e ser único.',
  })
  @ApiBody({ type: CreateSupplierBody })
  @ApiCreatedResponse({
    description: 'Fornecedor criado',
    type: SupplierPresenter,
  })
  async create(
    @Body(new ZodValidationPipe(createSupplierSchema)) dto: CreateSupplierDto,
  ) {
    const output = await this.createUseCase.execute(dto)
    return new SupplierPresenter(output)
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar fornecedor por ID',
    description: 'Retorna um fornecedor. 404 se o ID não existir.',
  })
  @ApiOkResponse({
    description: 'Fornecedor encontrado',
    type: SupplierPresenter,
  })
  async findOne(@Param('id') id: string) {
    const output = await this.getUseCase.execute({ id })
    return new SupplierPresenter(output)
  }

  @Get()
  @ApiOperation({
    summary: 'Listar fornecedores',
    description: 'Lista paginada. Query: page, perPage, sort, sortDir, filter.',
  })
  @ApiOkResponse({
    description: 'Lista de fornecedores',
    type: SupplierCollectionPresenter,
  })
  async search(
    @Query(new ZodValidationPipe(listSuppliersSchema)) params: ListSuppliersDto,
  ) {
    const output = await this.listUseCase.execute(params)
    return new SupplierCollectionPresenter(output)
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Atualizar fornecedor',
    description: 'CNPJ não muda. Envie só name, email e phone.',
  })
  @ApiBody({ type: UpdateSupplierBody })
  @ApiOkResponse({
    description: 'Fornecedor atualizado',
    type: SupplierPresenter,
  })
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateSupplierSchema)) dto: UpdateSupplierDto,
  ) {
    const output = await this.updateUseCase.execute({ id, ...dto })
    return new SupplierPresenter(output)
  }

  @HttpCode(204)
  @Delete(':id')
  @ApiOperation({
    summary: 'Remover fornecedor',
    description: '204 sem body. Falha se houver produto vinculado.',
  })
  @ApiNoContentResponse({ description: 'Fornecedor removido' })
  async remove(@Param('id') id: string) {
    await this.deleteUseCase.execute({ id })
  }
}
