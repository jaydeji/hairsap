import { z } from 'zod'

export const PostMarkBookingAsCompletedReqSchema = z
  .object({
    proId: z.number(),
    bookingId: z.number(),
  })
  .strict()

export type PostMarkBookingAsCompletedReq = z.infer<
  typeof PostMarkBookingAsCompletedReqSchema
>
