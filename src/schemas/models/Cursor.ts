import { z } from 'zod'

export const CursorSchema = z
  .object({
    cursor: z.number().optional(),
    take: z.number().optional(),
    desc: z.boolean().optional(),
  })
  .strict()

export type Cursor = z.infer<typeof CursorSchema>
