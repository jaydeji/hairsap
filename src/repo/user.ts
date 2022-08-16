import { Prisma, PrismaClient } from '@prisma/client'
import { PostSubscribeReq } from '../schemas/request/postSubscribe'
import { Role } from '../types'

const getUserById =
  ({ db }: { db: PrismaClient }) =>
  (userId: number) => {
    return db.user.findUnique({
      where: {
        userId,
      },
      include: {
        devices: true,
      },
    })
  }

const getUserByIdAndOtp =
  ({ db }: { db: PrismaClient }) =>
  (userId: number) => {
    return db.user.findUnique({
      where: {
        userId,
      },
      include: {
        otp: true,
      },
    })
  }

const getUserByEmail = ({ email, db }: { db: PrismaClient; email: string }) => {
  return db.user.findUnique({
    where: {
      email,
    },
    include: {
      devices: true,
    },
  })
}

const getUserByEmailandRole = async ({
  email,
  role,
  db,
}: {
  db: PrismaClient
  email: string
  role: Role
}) => {
  const user = await db.user.findUnique({
    where: {
      email,
    },
  })

  return user?.role === role ? user : null
}

const createUser = ({
  user,
  db,
}: {
  db: PrismaClient
  user: Prisma.UserCreateInput
}) => db.user.create({ data: user })

const updateUser =
  ({ db }: { db: PrismaClient }) =>
  (userId: number, user: Prisma.UserUpdateInput) =>
    db.user.update({
      data: user,
      where: {
        userId: userId,
      },
    })

const resetPassword =
  ({ db }: { db: PrismaClient }) =>
  (userId: number, expiredAt: Date, token: string) =>
    db.passwordReset.create({
      data: {
        userId,
        expiredAt,
        token,
      },
    })

const getResetPasswordToken =
  ({ db }: { db: PrismaClient }) =>
  (userId: number, token: string) =>
    db.passwordReset.findUnique({
      where: {
        userId_token: {
          token,
          userId,
        },
      },
    })

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

const subscribe =
  ({ db }: { db: PrismaClient }) =>
  ({ userId, proId }: PostSubscribeReq) =>
    db.subscription.create({
      data: {
        proId,
        userId,
      },
    })

// TODO: add review count and ratings
const getUserSubscriptions =
  ({ db }: { db: PrismaClient }) =>
  (userId: number) =>
    db.subscription.findMany({
      where: {
        userId,
      },
      include: {
        pros: {
          select: {
            userId: true,
            photoUrl: true,
            name: true,
          },
        },
      },
    })

const makeUserRepo = ({ db }: { db: PrismaClient }) => {
  return {
    getUserById: getUserById({ db }),
    getUserByIdAndOtp: getUserByIdAndOtp({ db }),
    getUserByEmail: (email: string) => getUserByEmail({ db, email }),
    getUserByEmailandRole: (email: string, role: Role) =>
      getUserByEmailandRole({ db, email, role }),
    createUser: (user: Prisma.UserCreateInput) => createUser({ user, db }),
    updateUser: updateUser({ db }),
    resetPassword: resetPassword({ db }),
    getResetPasswordToken: getResetPasswordToken({ db }),
    deleteResetPasswordToken: deleteResetPasswordToken({ db }),
    subscribe: subscribe({ db }),
    getUserSubscriptions: getUserSubscriptions({ db }),
  }
}

export default makeUserRepo
