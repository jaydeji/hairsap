import { z } from 'zod'

export const GetAllUsersReqSchema = z
  .object({
    userId: z.number().optional(),
    name: z.string().optional(),
  })
  .strict()

export type GetAllUsersReq = z.infer<typeof GetAllUsersReqSchema>
