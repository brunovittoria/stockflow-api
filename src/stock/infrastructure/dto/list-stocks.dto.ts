import { z } from 'zod'

export const listStocksSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  perPage: z.coerce.number().int().positive().optional(),
  sort: z.string().optional().nullable(),
  sortDir: z.enum(['asc', 'desc']).optional().nullable(),
  filter: z.string().optional().nullable(),
})

export type ListStocksDto = z.infer<typeof listStocksSchema>
