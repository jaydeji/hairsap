import { z } from 'zod'
import { ROLES } from '../../config/constants'

const PostLoginResponseSchema = z
  .object({
    address: z.string().min(2),
    email: z.string().email(),
    name: z.string(),
    photoUrl: z.string().optional().nullable(),
    userId: z.number(),
    phone: z.string(),
    role: z.nativeEnum(ROLES),
    profilePhotoUrl: z.string().optional().nullable(),
    terminated: z.boolean().optional().nullable(),
    deactivated: z.boolean().optional().nullable(),
    deactivatedReason: z.string().optional().nullable(),
    reactivationRequested: z.boolean().optional().nullable(),
    verified: z.boolean().optional().nullable(),
    available: z.boolean().optional().nullable(),
    workVideoUrl: z.string().optional().nullable(),
    businessName: z.string().optional().nullable(),
  })
  .passthrough()
  .strict()
  .strip()

export type PostLoginResponse = z.infer<typeof PostLoginResponseSchema>

export { PostLoginResponseSchema }
