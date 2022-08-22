import { User } from '@prisma/client'
import { Role } from '../../src/types'

declare global {
  namespace Express {
    interface Request {
      tokenData?: {
        email: string
        proId?: number
        adminId?: number
        userId?: number
        role: Role
      }
    }
  }
}
