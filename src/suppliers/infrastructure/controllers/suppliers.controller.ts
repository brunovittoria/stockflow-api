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

@Controller('suppliers')
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
  async create(
    @Body(new ZodValidationPipe(createSupplierSchema)) dto: CreateSupplierDto,
  ) {
    const output = await this.createUseCase.execute(dto)
    return new SupplierPresenter(output)
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const output = await this.getUseCase.execute({ id })
    return new SupplierPresenter(output)
  }

  @Get()
  async search(
    @Query(new ZodValidationPipe(listSuppliersSchema)) params: ListSuppliersDto,
  ) {
    const output = await this.listUseCase.execute(params)
    return new SupplierCollectionPresenter(output)
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateSupplierSchema)) dto: UpdateSupplierDto,
  ) {
    const output = await this.updateUseCase.execute({ id, ...dto })
    return new SupplierPresenter(output)
  }

  @HttpCode(204)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.deleteUseCase.execute({ id })
  }
}
