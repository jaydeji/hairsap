import { z } from 'zod'

export const PushAudience = { ALL: 'all', PROS: 'pros', USERS: 'users' }

export const PostPushNotificationReqSchema = z
  .object({
    audience: z.nativeEnum(PushAudience).optional(),
    userIds: z.array(z.number()).optional(),
    title: z.string(),
    body: z.string(),
  })
  .strict()
  .superRefine(({ audience, userIds }, ctx) => {
    if ((!audience && !userIds) || (audience && userIds)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['audience', 'userIds'],
        message: 'only one of audience or userIds must be provided ',
      })
    }
  })

export type PostPushNotificationReq = z.infer<
  typeof PostPushNotificationReqSchema
>
