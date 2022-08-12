import { z } from 'zod'

export const PostBookProReqSchema = z
  .object({
    subServiceId: z.number(),
    latitude: z.number().refine((e) => Math.abs(e) <= 90),
    longitude: z.number().refine((e) => Math.abs(e) <= 180),
    userId: z.number(),
    proId: z.number(),
    address: z.string().min(5),
  })
  .strict()

export type PostBookProReq = z.infer<typeof PostBookProReqSchema>
