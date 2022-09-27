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
  .superRefine(({ distance, userId }, ctx) => {
    if ((distance && !userId) || (!distance && userId)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['distance', 'userId'],
        message: 'distance or userId or none of them must be provided ',
      })
    }
  })

export type PostGetProReq = z.infer<typeof PostGetProReqSchema>
