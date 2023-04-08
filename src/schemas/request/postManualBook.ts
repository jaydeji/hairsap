import { z } from 'zod'
import { CHANNEL } from '../../config/constants'

export const PostManualBookReqSchema = z
  .object({
    subServiceIds: z.array(z.number()).min(1),
    latitude: z.number().refine((e) => Math.abs(e) <= 90),
    longitude: z.number().refine((e) => Math.abs(e) <= 180),
    userId: z.number(),
    proId: z.number(),
    address: z.string().min(5),
    channel: z.nativeEnum(CHANNEL),
    code: z.string().optional(),
    samplePhotoKey: z.string().optional(),
    samplePhotoOriginalFileName: z.string().optional(),
    samplePhotoUrl: z.string().optional(),
    auto: z.boolean(),
  })
  .strict()

export type PostManualBookReq = z.infer<typeof PostManualBookReqSchema>
