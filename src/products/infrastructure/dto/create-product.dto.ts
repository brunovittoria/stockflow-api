import { z } from 'zod'

export const createProductSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  sku: z.string().min(1, 'SKU is required'),
  price: z.number().positive('Price must be positive'),
  costPrice: z.number().positive('Cost price must be positive'),
  category: z.string().min(1, 'Category is required'),
  supplierId: z.string().uuid('Supplier ID must be a valid UUID'),
  location: z.string().min(1, 'Location is required'),
  minQuantity: z.number().int().min(0, 'Min quantity cannot be negative'),
})

export type CreateProductDto = z.infer<typeof createProductSchema>
