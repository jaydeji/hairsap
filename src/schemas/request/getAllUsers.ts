import { z } from 'zod'
import { PageReqSchema } from './Page'

export const GetAllUsersReqSchema = z
  .object({
    name: z.string().optional(),
  })
  .merge(PageReqSchema)
  .strict()

export type GetAllUsersReq = z.infer<typeof GetAllUsersReqSchema>
