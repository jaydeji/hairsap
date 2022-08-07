import { Role } from '@prisma/client'
import { z } from 'zod'

export const PostLoginRequestSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(6).max(32),
    role: z.nativeEnum(Role),
  })
  .strict()

export type PostLoginRequest = z.infer<typeof PostLoginRequestSchema>

export const PostLoginUserRequestSchema = PostLoginRequestSchema.extend({
  deviceInfo: z.string(),
})
export type PostLoginUserRequest = z.infer<typeof PostLoginUserRequestSchema>

export const PostLoginProRequestSchema = PostLoginRequestSchema.extend({
  deviceInfo: z.string(),
})
export type PostLoginProRequest = z.infer<typeof PostLoginProRequestSchema>
