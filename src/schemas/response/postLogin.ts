import { Role } from '@prisma/client'
import { z } from 'zod'

const PostLoginResponseSchema = z
  .object({
    address: z.string(),
    email: z.string().email(),
    name: z.string(),
    photoUrl: z.string(),
    role: z.nativeEnum(Role),
    userId: z.number(),
  })
  .strict()

export type PostLoginResponse = z.infer<typeof PostLoginResponseSchema>

export { PostLoginResponseSchema }
