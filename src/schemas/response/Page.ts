import { z } from 'zod'

export const PageResSchema = z
  .object({
    total: z.number(),
    skipped: z.number(),
    perPage: z.number(),
    page: z.number(),
    pageCount: z.number(),
  })
  .strict()

export type PageRes = z.infer<typeof PageResSchema>
