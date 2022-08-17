import { z } from 'zod'
import { ROLES } from '../../config/constants'

export const PostMarkBookingAsUserCompletedReqSchema = z
  .object({
    userId: z.number(),
    bookingId: z.number(),
    role: z.literal(ROLES.USER),
  })
  .strict()

export type PostMarkBookingAsUserCompletedReq = z.infer<
  typeof PostMarkBookingAsUserCompletedReqSchema
>

export const PostMarkBookingAsProCompletedReqSchema = z
  .object({
    proId: z.number(),
    bookingId: z.number(),
    role: z.literal(ROLES.PRO),
  })
  .strict()

export type PostMarkBookingAsProCompletedReq = z.infer<
  typeof PostMarkBookingAsProCompletedReqSchema
>
