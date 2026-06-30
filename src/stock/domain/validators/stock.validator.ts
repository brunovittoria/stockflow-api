import { z } from 'zod'
import { ZodValidatorFields } from '@/shared/domain/validators/zod-validator-fields'

export const stockSchema = z.object({
  productId: z.string().uuid('Product ID must be a valid UUID'),
  quantity: z
    .number()
    .int('Quantity must be an integer')
    .nonnegative('Quantity must be zero or positive'),
  minQuantity: z
    .number()
    .int('Min quantity must be an integer')
    .nonnegative('Min quantity must be zero or positive'),
  location: z.string().optional(),
  isActive: z.boolean().default(true),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
})

// Tipo inferido automaticamente — zero duplicação serve para todas as entidades
export type StockValidated = z.infer<typeof stockSchema>

// Implementação concreta da interface ValidatorFieldsInterface
export class StockValidator extends ZodValidatorFields<StockValidated> {
  constructor() {
    super(stockSchema)
  }
}

// Factory para criar instâncias do validator sem precisar instanciar a classe
export class StockValidatorFactory {
  static create(): StockValidator {
    return new StockValidator()
  }
}
