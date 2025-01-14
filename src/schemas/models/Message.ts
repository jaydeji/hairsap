import { z } from 'zod'
import { MESSAGE_TYPE } from '../../config/constants'

export const MessageSchema = z
  .object({
    // createdAt: z
    //   .string()
    //   .refine((str) =>
    //     str.match(
    //       new RegExp(
    //         /(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))/,
    //       ),
    //     ),
    //   ),
    photoUrl: z.string().optional(),
    message: z.string().optional(),
    // senderId: z.number(),
    receiverId: z.number(),
    messageType: z.nativeEnum(MESSAGE_TYPE),
  })
  .strict()
  .superRefine(({ message, photoUrl }, ctx) => {
    if (!message && !photoUrl) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['message', 'photoUrl'],
        message: 'message or photoUrl must be provided',
      })
    }
  })

export type ChatMessageType = z.infer<typeof MessageSchema>
