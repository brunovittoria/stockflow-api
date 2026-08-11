import { z } from 'zod'

export const updateStockSchema = z.object({
  quantity: z.number().int().min(0, 'Quantity cannot be negative'),
  minQuantity: z.number().int().min(0, 'Min quantity cannot be negative'),
  location: z.string().min(1, 'Location is required'),
  isActive: z.boolean(),
})

export type UpdateStockDto = z.infer<typeof updateStockSchema>
