import { z } from 'zod'

export const updateProductSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.number().positive('Price must be positive'),
  costPrice: z.number().positive('Cost price must be positive'),
  category: z.string().min(1, 'Category is required'),
})

export type UpdateProductDto = z.infer<typeof updateProductSchema>
