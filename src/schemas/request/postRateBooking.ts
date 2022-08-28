import { z } from 'zod'

export const PostRateBookingReqSchema = z
  .object({
    userId: z.number(),
    bookingId: z.number(),
    rating: z.number().min(1).max(5),
    review: z.string().nullable().optional(),
  })
  .strict()

export type PostRateBookingReq = z.infer<typeof PostRateBookingReqSchema>
