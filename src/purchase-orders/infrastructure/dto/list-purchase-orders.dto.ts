import { z } from 'zod'

export const listPurchaseOrdersSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  perPage: z.coerce.number().int().positive().optional(),
  sort: z.string().optional().nullable(),
  sortDir: z.enum(['asc', 'desc']).optional().nullable(),
  filter: z.string().optional().nullable(),
})

export type ListPurchaseOrdersDto = z.infer<typeof listPurchaseOrdersSchema>
