import { z } from 'zod'

export const updateSupplierSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone is required'),
})

export type UpdateSupplierDto = z.infer<typeof updateSupplierSchema>
