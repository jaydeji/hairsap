import { z } from 'zod'
import { CHANNEL } from '../../config/constants'

export const PostBookProReqSchema = z
  .object({
    subServiceIds: z.array(z.number()).min(1),
    latitude: z.number().refine((e) => Math.abs(e) <= 90),
    longitude: z.number().refine((e) => Math.abs(e) <= 180),
    userId: z.number(),
    proId: z.number(),
    address: z.string().min(5),
    channel: z.nativeEnum(CHANNEL),
    code: z.string().optional(),
  })
  .strict()

export type PostBookProReq = z.infer<typeof PostBookProReqSchema>
