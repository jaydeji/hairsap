import { z } from 'zod'
import { ROLES } from '../../config/constants'

export const PostMarkBookingAsArrivedReqSchema = z
  .object({
    proId: z.number(),
    bookingId: z.number(),
    role: z.literal(ROLES.PRO),
  })
  .strict()

export type PostMarkBookingAsArrivedReq = z.infer<
  typeof PostMarkBookingAsArrivedReqSchema
>
