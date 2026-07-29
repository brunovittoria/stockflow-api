import { UseCase as UseCaseInterface } from '@/shared/application/usecases/use-case'
import { StockRepository } from '@/stock/domain/repositories/stock.repository'
import { StockEntity } from '@/stock/domain/entities/stock.entity'

/**
 * ListCriticalStockUseCase
 *
 * Lista todos os estoques cujo quantity < minQuantity (estoque crítico).
 * Usa findBelowMinQuantity() do repositório, que já aplica essa regra.
 * Uma lista vazia é um resultado válido — significa que não há estoques críticos.
 *
 * Regras de negócio aplicadas:
 *  - Estoque crítico é aquele onde quantity < minQuantity (getter isCritical da entidade)
 *
 * Fluxo:
 *  1. Busca todos os estoques críticos via findBelowMinQuantity()
 *  2. Mapeia as entidades para objetos de output
 *  3. Retorna a lista (pode ser vazia)
 */

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace ListCriticalStockUseCase {
  export type Input = Record<string, never>

  export type StockOutput = {
    id: string
    productId: string
    quantity: number
    minQuantity: number
    location: string
    isActive: boolean
    isCritical: boolean
    createdAt: Date
    updatedAt: Date
  }

  export interface Output {
    items: StockOutput[]
    total: number
  }

  export class UseCase implements UseCaseInterface<Input, Output> {
    constructor(private stockRepository: StockRepository) {}

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async execute(_input: Input): Promise<Output> {
      const items = await this.stockRepository.findBelowMinQuantity()

      return {
        items: items.map((entity) => this.toOutput(entity)),
        total: items.length,
      }
    }

    private toOutput(entity: StockEntity): StockOutput {
      return {
        id: entity.id,
        productId: entity.productId,
        quantity: entity.quantity,
        minQuantity: entity.minQuantity,
        location: entity.location,
        isActive: entity.isActive,
        isCritical: entity.isCritical,
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt,
      }
    }
  }
}
