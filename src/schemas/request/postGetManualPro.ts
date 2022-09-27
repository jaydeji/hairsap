import { z } from 'zod'

export const PostGetManualProReqSchema = z
  .object({
    subServiceId: z.number(),
    latitude: z.number().refine((e) => Math.abs(e) <= 90),
    longitude: z.number().refine((e) => Math.abs(e) <= 180),
    userId: z.number(),
  })
  .strict()

export type PostGetManualProReq = z.infer<typeof PostGetManualProReqSchema>
