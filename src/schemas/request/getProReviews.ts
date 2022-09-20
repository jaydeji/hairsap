import { z } from 'zod'
import { CursorSchema } from '../models/Cursor'

export const GetProReviewsReqSchema = z
  .object({
    proId: z.number().min(1),
  })
  .strict()
  .merge(CursorSchema)

export type GetProReviewsReq = z.infer<typeof GetProReviewsReqSchema>
