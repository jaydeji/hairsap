import { z } from 'zod'
import { PageReqSchema } from './Page'

export const GetAllProsReqSchema = z
  .object({
    serviceId: z.number().optional(),
    name: z.string().optional(),
  })
  .merge(PageReqSchema)
  .strict()

export type GetAllProsReq = z.infer<typeof GetAllProsReqSchema>
