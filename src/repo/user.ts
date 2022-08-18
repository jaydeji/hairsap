import { Prisma, PrismaClient } from '@prisma/client'
import { PostSubscribeReq } from '../schemas/request/postSubscribe'

const getUserById =
  ({ db }: { db: PrismaClient }) =>
  (userId: number) => {
    return db.user.findUnique({
      where: {
        userId,
      },
      include: {
        devices: true,
        otp: true,
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

const getUserByEmail =
  ({ db }: { db: PrismaClient }) =>
  (email: string) => {
    return db.user.findUnique({
      where: {
        email,
      },
      include: {
        devices: true,
      },
    })
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
            proId: true,
            profilePhotoUrl: true,
            name: true,
          },
        },
      },
    })

const makeUserRepo = ({ db }: { db: PrismaClient }) => {
  return {
    getUserById: getUserById({ db }),
    getUserByIdAndOtp: getUserByIdAndOtp({ db }),
    getUserByEmail: getUserByEmail({ db }),
    createUser: (user: Prisma.UserCreateInput) => createUser({ user, db }),
    updateUser: updateUser({ db }),
    subscribe: subscribe({ db }),
    getUserSubscriptions: getUserSubscriptions({ db }),
  }
}

export default makeUserRepo
