import { z } from 'zod'

export const EntitySchema = z
  .object({
    userId: z.number().optional(),
    adminId: z.number().optional(),
    proId: z.number().optional(),
  })
  .strict()

export type Entity = z.infer<typeof EntitySchema>
