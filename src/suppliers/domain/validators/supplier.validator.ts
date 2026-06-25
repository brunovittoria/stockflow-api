import { z } from 'zod'
import { ZodValidatorFields } from '@/shared/domain/validators/zod-validator-fields'

export const supplierSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(255, 'Name must be less than 255 characters'),
  cnpj: z.string().regex(/^\d{14}$/, 'CNPJ must be 14 digits'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  isActive: z.boolean().default(true),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
})

export type SupplierValidated = z.infer<typeof supplierSchema>

export class SupplierValidator extends ZodValidatorFields<SupplierValidated> {
  constructor() {
    super(supplierSchema)
  }
}

export class SupplierValidatorFactory {
  static create(): SupplierValidator {
    return new SupplierValidator()
  }
}
