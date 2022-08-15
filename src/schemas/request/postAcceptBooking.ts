import { z } from 'zod'

export const PostAcceptBookingReqSchema = z
  .object({
    userId: z.number(),
    bookingId: z.number(),
  })
  .strict()

export type PostAcceptBookingReq = z.infer<typeof PostAcceptBookingReqSchema>
