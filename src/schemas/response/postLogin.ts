import { z } from 'zod'
import { ROLES } from '../../config/constants'
import { isValidPhone } from '../../utils'

const PostLoginResponseSchema = z
  .object({
    email: z.string().email(),
    name: z.string(),
    userId: z.number(),
    phone: z.string().refine((e) => isValidPhone(e)),
    role: z.nativeEnum(ROLES),
    profilePhotoUrl: z.string().optional().nullable(),
    terminated: z.boolean().optional().nullable(),
    deactivated: z.boolean().optional().nullable(),
    deactivations: z.array(z.any()).optional(),
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
