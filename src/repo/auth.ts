import { PrismaClient } from '@prisma/client'

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
  ({ userId, token }: { userId: number; token: string }) => {
    return db.passwordReset.findUnique({
      where: {
        userId_token: {
          token,
          userId,
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
