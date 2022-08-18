import { z } from 'zod'
import { ROLES } from '../../config/constants'

export const RoleSchema = z.nativeEnum(ROLES)

export type RoleSchemaType = z.infer<typeof RoleSchema>
