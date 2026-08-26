import { ApiProperty } from '@nestjs/swagger'
import { z } from 'zod'

export const updateStockSchema = z.object({
  quantity: z.number().int().min(0, 'Quantity cannot be negative'),
  minQuantity: z.number().int().min(0, 'Min quantity cannot be negative'),
  location: z.string().min(1, 'Location is required'),
  isActive: z.boolean(),
})

export type UpdateStockDto = z.infer<typeof updateStockSchema>

export class UpdateStockBody {
  @ApiProperty({ example: 50 })
  quantity!: number

  @ApiProperty({ example: 10 })
  minQuantity!: number

  @ApiProperty({ example: 'B3' })
  location!: string

  @ApiProperty({ example: true })
  isActive!: boolean
}
