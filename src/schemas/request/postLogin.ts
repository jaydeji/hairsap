import { z } from 'zod'

const PostLoginRequestSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(6).max(32),
  })
  .strict()

export type PostLoginRequest = z.infer<typeof PostLoginRequestSchema>

export { PostLoginRequestSchema }
