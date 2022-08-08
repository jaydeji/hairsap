import { z } from 'zod'
import { ROLES } from '../../config/constants'

const PostLoginResponseSchema = z
  .object({
    address: z.string().optional().nullable(),
    email: z.string().email(),
    name: z.string(),
    photoUrl: z.string().optional().nullable(),
    role: z.nativeEnum(ROLES),
    userId: z.number(),
  })
  .passthrough()
  .strict()
  .strip()

export type PostLoginResponse = z.infer<typeof PostLoginResponseSchema>

export { PostLoginResponseSchema }
