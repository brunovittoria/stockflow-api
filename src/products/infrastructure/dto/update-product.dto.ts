import { ApiProperty } from '@nestjs/swagger'
import { z } from 'zod'

export const updateProductSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.number().positive('Price must be positive'),
  costPrice: z.number().positive('Cost price must be positive'),
  category: z.string().min(1, 'Category is required'),
})

export type UpdateProductDto = z.infer<typeof updateProductSchema>

export class UpdateProductBody {
  @ApiProperty({ example: 'Whey Protein 1kg Atualizado' })
  name!: string

  @ApiProperty({ example: 'Nova descrição' })
  description!: string

  @ApiProperty({ example: 17990, description: 'Preço de venda em centavos' })
  price!: number

  @ApiProperty({ example: 8500, description: 'Preço de custo em centavos' })
  costPrice!: number

  @ApiProperty({ example: 'Suplementos' })
  category!: string
}
