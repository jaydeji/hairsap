import { z } from 'zod'
import { ROLES } from '../../config/constants'

export const PostVerifyProReqSchema = z
  .object({
    userId: z.number(),
    role: z.nativeEnum(ROLES),
  })
  .strict()

export type PostVerifyProReq = z.infer<typeof PostVerifyProReqSchema>
