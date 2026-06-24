import { z } from 'zod'
import { ZodValidatorFields } from '@/shared/domain/validators/zod-validator-fields'

// Schema Zod — define regras E infere o tipo automaticamente
export const productSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(255, 'Name must be less than 255 characters'),
  description: z
    .string()
    .max(1000, 'Description must be less than 1000 characters')
    .default(''),
  sku: z
    .string()
    .regex(
      /^[A-Z0-9-]{3,20}$/,
      'SKU must be 3-20 uppercase alphanumeric characters or hyphens',
    ),
  price: z
    .number()
    .int('Price must be in cents (integer)')
    .positive('Price must be positive'),
  costPrice: z
    .number()
    .int('Cost price must be in cents (integer)')
    .positive('Cost price must be positive'),
  category: z.string().min(1, 'Category is required'),
  supplierId: z.string().uuid('Supplier ID must be a valid UUID'),
  isActive: z.boolean().default(true),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
})

// Tipo inferido automaticamente — zero duplicação
export type ProductValidated = z.infer<typeof productSchema>

export class ProductValidator extends ZodValidatorFields<ProductValidated> {
  constructor() {
    super(productSchema)
  }
}

export class ProductValidatorFactory {
  static create(): ProductValidator {
    return new ProductValidator()
  }
}
