import { z } from 'zod'

export const PostGetProReqSchema = z
  .object({
    subServiceId: z.number(),
    latitude: z.number().refine((e) => Math.abs(e) <= 90),
    longitude: z.number().refine((e) => Math.abs(e) <= 180),
    userId: z.number().optional(),
    distance: z.number().optional(),
  })
  .strict()

export type PostGetProReq = z.infer<typeof PostGetProReqSchema>
