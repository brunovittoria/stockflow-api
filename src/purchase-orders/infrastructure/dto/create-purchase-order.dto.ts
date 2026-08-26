import { ApiProperty } from '@nestjs/swagger'
import { z } from 'zod'

export const createPurchaseOrderSchema = z.object({
  supplierId: z.string().uuid('Supplier ID must be a valid UUID'),
  items: z
    .array(
      z.object({
        productId: z.string().uuid('Product ID must be a valid UUID'),
        quantity: z
          .number()
          .int()
          .positive('Quantity must be a positive integer'),
        unitCost: z.number().positive('Unit cost must be positive'),
      }),
    )
    .min(1, 'Order must have at least one item'),
})

export type CreatePurchaseOrderDto = z.infer<typeof createPurchaseOrderSchema>

export class PurchaseOrderItemBody {
  @ApiProperty({ example: '00000000-0000-0000-0000-000000000000' })
  productId!: string

  @ApiProperty({ example: 100 })
  quantity!: number

  @ApiProperty({ example: 8000, description: 'Custo unitário em centavos' })
  unitCost!: number
}

export class CreatePurchaseOrderBody {
  @ApiProperty({ example: '00000000-0000-0000-0000-000000000000' })
  supplierId!: string

  @ApiProperty({ type: [PurchaseOrderItemBody] })
  items!: PurchaseOrderItemBody[]
}
