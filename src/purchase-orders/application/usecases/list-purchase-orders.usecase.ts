import { UseCase as UseCaseInterface } from '@/shared/application/usecases/use-case'
import { PurchaseOrderRepository } from '@/purchase-orders/domain/repositories/purchase-order.repository'
import {
  SearchParams,
  SearchResult,
} from '@/shared/domain/repositories/repository-contracts'
import {
  PurchaseOrderItem,
  PurchaseOrderStatus,
} from '@/purchase-orders/domain/entities/purchase-order.entity'
import { PurchaseOrderEntity } from '@/purchase-orders/domain/entities/purchase-order.entity'

/**
 * ListPurchaseOrdersUseCase
 *
 * Lista todos os pedidos de compra com suporte a paginação e ordenação.
 *
 * Regras de negócio aplicadas:
 *
 * Fluxo:
 *  1. Recebe os parâmetros de busca (filter, sort, sortDir, page, perPage)
 *  2. Delega ao repositório via search()
 *  3. Mapeia as entidades para objetos de output
 *  4. Retorna os itens junto com os metadados de paginação
 */

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace ListPurchaseOrdersUseCase {
  export type Input = SearchParams

  export type PurchaseOrderOutput = {
    id: string
    supplierId: string
    status: PurchaseOrderStatus
    items: PurchaseOrderItem[]
    totalCost: number
    createdAt: Date
    updatedAt: Date
  }

  export type Output = Omit<SearchResult<PurchaseOrderOutput>, 'items'> & {
    items: PurchaseOrderOutput[]
  }

  export class UseCase implements UseCaseInterface<Input, Output> {
    constructor(private purchaseOrderRepository: PurchaseOrderRepository) {}

    async execute(input: Input): Promise<Output> {
      const result = await this.purchaseOrderRepository.search(input)

      return {
        items: result.items.map((entity) => this.toOutput(entity)),
        total: result.total,
        currentPage: result.currentPage,
        perPage: result.perPage,
        lastPage: result.lastPage,
      }
    }

    private toOutput(entity: PurchaseOrderEntity): PurchaseOrderOutput {
      return {
        id: entity.id,
        supplierId: entity.supplierId,
        status: entity.status,
        items: entity.items,
        totalCost: entity.totalCost,
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt,
      }
    }
  }
}
