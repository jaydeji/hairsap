import { z } from 'zod'

const PostLoginResponseSchema = z
  .object({
    address: z.string().optional().nullable(),
    email: z.string().email(),
    name: z.string(),
    photoUrl: z.string().optional().nullable(),
    userId: z.number(),
  })
  .passthrough()
  .strict()
  .strip()

export type PostLoginResponse = z.infer<typeof PostLoginResponseSchema>

export { PostLoginResponseSchema }
