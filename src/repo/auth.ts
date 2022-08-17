import { PrismaClient } from '@prisma/client'

const resetPassword =
  ({ db }: { db: PrismaClient }) =>
  ({
    userId,
    adminId,
    proId,
    expiredAt,
    token,
  }: {
    expiredAt: Date
    token: string
    userId?: number
    adminId?: number
    proId?: number
  }) =>
    db.passwordReset.create({
      data: {
        userId,
        adminId,
        proId,
        expiredAt,
        token,
      },
    })

const getResetPasswordToken =
  ({ db }: { db: PrismaClient }) =>
  ({
    userId,
    adminId,
    proId,
    token,
  }: {
    userId?: number
    adminId?: number
    proId?: number
    token: string
  }) => {
    if (userId)
      return db.passwordReset.findUnique({
        where: {
          userId_token: {
            token,
            userId,
          },
        },
      })
    if (adminId)
      return db.passwordReset.findUnique({
        where: {
          adminId_token: {
            token,
            adminId,
          },
        },
      })
    if (proId)
      return db.passwordReset.findUnique({
        where: {
          proId_token: {
            token,
            proId,
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

const makAuthoRepo = ({ db }: { db: PrismaClient }) => {
  return {
    resetPassword: resetPassword({ db }),
    getResetPasswordToken: getResetPasswordToken({ db }),
    deleteResetPasswordToken: deleteResetPasswordToken({ db }),
  }
}

export default makAuthoRepo
