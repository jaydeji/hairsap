import { z } from 'zod'
import { CHANNEL } from '../../config/constants'

export const PostAutoBookReqSchema = z
  .object({
    subServiceIds: z.array(z.number()).min(1),
    latitude: z.number().refine((e) => Math.abs(e) <= 90),
    longitude: z.number().refine((e) => Math.abs(e) <= 180),
    userId: z.number(),
    lastProId: z.number().optional(),
    distance: z.number().optional(),
    address: z.string().min(5),
    channel: z.nativeEnum(CHANNEL),
    code: z.string().optional(),
    samplePhotoKey: z.string().optional(),
    samplePhotoOriginalFileName: z.string().optional(),
    samplePhotoUrl: z.string().optional(),
    auto: z.boolean(),
  })
  .strict()
  .superRefine(({ distance, lastProId }, ctx) => {
    if ((distance && !lastProId) || (!distance && lastProId)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['distance', 'lastProId'],
        message: 'distance or lastProId or none of them must be provided ',
      })
    }
  })

export type PostAutoBookReq = z.infer<typeof PostAutoBookReqSchema>
