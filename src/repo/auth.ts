import { PrismaClient } from '@prisma/client'
import { Role } from '../types'

const resetPassword =
  ({ db }: { db: PrismaClient }) =>
  ({
    userId,
    expiredAt,
    token,
  }: {
    expiredAt: Date
    token: string
    userId: number
  }) =>
    db.passwordReset.create({
      data: {
        userId,
        expiredAt,
        token,
      },
    })

const getResetPasswordToken =
  ({ db }: { db: PrismaClient }) =>
  ({ email, token, role }: { email: string; token: string; role: Role }) => {
    return db.passwordReset.findFirst({
      where: {
        token,
        user: {
          email,
          role,
        },
      },
    })
  }

const deleteResetPasswordToken =
  ({ db }: { db: PrismaClient }) =>
  (userId: number, token: string) =>
    db.passwordReset.delete({
      where: {
        userId_token: {
          token,
          userId,
        },
      },
    })

const makAuthRepo = ({ db }: { db: PrismaClient }) => {
  return {
    resetPassword: resetPassword({ db }),
    getResetPasswordToken: getResetPasswordToken({ db }),
    deleteResetPasswordToken: deleteResetPasswordToken({ db }),
  }
}

export default makAuthRepo
