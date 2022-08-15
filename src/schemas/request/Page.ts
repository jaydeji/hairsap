import { z } from 'zod'

export const PageReqSchema = z
  .object({
    perPage: z.number().optional().default(20),
    page: z.number().optional().default(1),
  })
  .strict()

export type PageReq = z.infer<typeof PageReqSchema>
