import { z } from 'zod'

export const createSupplierSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  cnpj: z.string().regex(/^\d{14}$/, 'CNPJ must have 14 digits'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone is required'),
})

export type CreateSupplierDto = z.infer<typeof createSupplierSchema>
