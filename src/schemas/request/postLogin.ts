import { z } from 'zod'
import { ROLES } from '../../config/constants'

export const PostLoginRequestSchema = z
  .object({
    email: z.string().email().optional(),
    phone: z.string().min(0).optional(),
    password: z.string().min(6).max(32),
  })
  .strict()

export type PostLoginRequest = z.infer<typeof PostLoginRequestSchema>

export const PostLoginAdminRequestSchema = PostLoginRequestSchema.extend({
  role: z.literal(ROLES.ADMIN),
})
  .strict()
  .superRefine(({ email, phone }, ctx) => {
    if (!email && !phone) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['email', 'phone'],
        message: 'email or phone must be provided',
      })
    }
  })
export type PostLoginAdminRequest = z.infer<typeof PostLoginAdminRequestSchema>

export const PostLoginUserRequestSchema = PostLoginRequestSchema.extend({
  role: z.literal(ROLES.USER),
})
  .strict()
  .superRefine(({ email, phone }, ctx) => {
    if (!email && !phone) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['email', 'phone'],
        message: 'email or phone must be provided',
      })
    }
  })
export type PostLoginUserRequest = z.infer<typeof PostLoginUserRequestSchema>

export const PostLoginProRequestSchema = PostLoginRequestSchema.extend({
  role: z.literal(ROLES.PRO),
})
  .strict()
  .superRefine(({ email, phone }, ctx) => {
    if (!email && !phone) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['email', 'phone'],
        message: 'email or phone must be provided',
      })
    }
  })

export type PostLoginProRequest = z.infer<typeof PostLoginProRequestSchema>
