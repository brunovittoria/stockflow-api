import { ApiProperty } from '@nestjs/swagger'
import { z } from 'zod'

export const updateSupplierSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone is required'),
})

export type UpdateSupplierDto = z.infer<typeof updateSupplierSchema>

export class UpdateSupplierBody {
  @ApiProperty({ example: 'Distribuidora ABC Atualizada' })
  name!: string

  @ApiProperty({ example: 'novo@abc.com' })
  email!: string

  @ApiProperty({ example: '11988887777' })
  phone!: string
}
