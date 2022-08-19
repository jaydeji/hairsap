import { z } from 'zod'

export const PostMarkBookingAsArrivedReqSchema = z
  .object({
    proId: z.number(),
    bookingId: z.number(),
  })
  .strict()

export type PostMarkBookingAsArrivedReq = z.infer<
  typeof PostMarkBookingAsArrivedReqSchema
>
