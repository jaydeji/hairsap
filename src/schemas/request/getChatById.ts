import { z } from 'zod'
import { CursorSchema } from '../models/Cursor'

export const GetChatByIdReqSchema = z
  .object({
    userId: z.number().min(1),
    otherUserId: z.number().min(1),
  })
  .strict()
  .merge(CursorSchema)

export type GetChatByIdReq = z.infer<typeof GetChatByIdReqSchema>
