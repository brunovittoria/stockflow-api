import { ApiProperty } from '@nestjs/swagger'
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

export class CreateProductBody {
  @ApiProperty({ example: 'Whey Protein 1kg' })
  name!: string

  @ApiProperty({ example: 'Whey concentrado sabor chocolate' })
  description!: string

  @ApiProperty({ example: 'WHY-CH-1KG' })
  sku!: string

  @ApiProperty({ example: 15990, description: 'Preço de venda em centavos' })
  price!: number

  @ApiProperty({ example: 8000, description: 'Preço de custo em centavos' })
  costPrice!: number

  @ApiProperty({ example: 'Suplementos' })
  category!: string

  @ApiProperty({ example: '00000000-0000-0000-0000-000000000000' })
  supplierId!: string

  @ApiProperty({ example: 'A1', description: 'Local do estoque inicial' })
  location!: string

  @ApiProperty({
    example: 10,
    description: 'Quantidade mínima do estoque inicial',
  })
  minQuantity!: number
}
