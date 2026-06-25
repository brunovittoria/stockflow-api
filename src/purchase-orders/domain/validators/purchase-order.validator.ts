import { z } from 'zod'
import { ZodValidatorFields } from '@/shared/domain/validators/zod-validator-fields'

export const purchaseOrderSchema = z.object({
  supplierId: z.string().uuid('Supplier ID must be a valid UUID'),
  items: z.array(
    z.object({
      productId: z.string().uuid('Product ID must be a valid UUID'),
      quantity: z
        .number()
        .int('Quantity must be an integer')
        .positive('Quantity must be positive'),
      unitCost: z
        .number()
        .int('Unit cost must be an integer')
        .positive('Unit cost must be positive'),
    }),
  ),
  status: z.enum(['DRAFT', 'SENT', 'DELIVERED', 'CANCELLED']),
  totalCost: z
    .number()
    .int('Total cost must be an integer')
    .positive('Total cost must be positive'),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
})

// Tipo inferido automaticamente — zero duplicação serve para todas as entidades
export type PurchaseOrderValidated = z.infer<typeof purchaseOrderSchema>

// Implementação concreta da interface ValidatorFieldsInterface
export class PurchaseOrderValidator extends ZodValidatorFields<PurchaseOrderValidated> {
  constructor() {
    super(purchaseOrderSchema)
  }
}

// Factory para criar instâncias do validator sem precisar instanciar a classe
export class PurchaseOrderValidatorFactory {
  static create(): PurchaseOrderValidator {
    return new PurchaseOrderValidator()
  }
}
