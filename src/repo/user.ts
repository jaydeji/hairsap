import { Prisma, PrismaClient } from '@prisma/client'
import { ROLES } from '../config/constants'
import { PageReq } from '../schemas/request/Page'
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
    return db.user.findFirst({
      where: {
        email,
      },
    })
  }

const getUserByPhone =
  ({ db }: { db: PrismaClient }) =>
  (phone: string) => {
    return db.user.findFirst({
      where: {
        phone,
      },
    })
  }

const getUserByEmailAndRole =
  ({ db }: { db: PrismaClient }) =>
  (email: string, role: Role) => {
    return db.user.findUnique({
      where: {
        email_role: { email, role },
      },
    })
  }

const getUserByPhoneAndRole =
  ({ db }: { db: PrismaClient }) =>
  (phone: string, role: Role) => {
    return db.user.findUnique({
      where: {
        phone_role: { phone, role },
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

const deleteUser =
  ({ db }: { db: PrismaClient }) =>
  (userId: number) =>
    db.user.delete({ where: { userId } })

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
            userId: true,
            profilePhotoUrl: true,
            name: true,
          },
        },
      },
    })

const getAllUsers =
  ({ db }: { db: PrismaClient }) =>
  ({
    userId,
    name,
  }: PageReq & { skip: number } & { userId?: number; name?: string }) => {
    const where = {
      role: ROLES.USER,
      userId,
      name: {
        contains: name,
      },
    }
    return db.$transaction([
      db.user.count({
        where,
      }),
      db.user.findMany({
        where,
      }),
    ])
  }

const makeUserRepo = ({ db }: { db: PrismaClient }) => {
  return {
    getUserById: getUserById({ db }),
    getUserByIdAndOtp: getUserByIdAndOtp({ db }),
    getUserByEmail: getUserByEmail({ db }),
    getUserByPhone: getUserByPhone({ db }),
    getUserByEmailAndRole: getUserByEmailAndRole({ db }),
    getUserByPhoneAndRole: getUserByPhoneAndRole({ db }),
    createUser: (user: Prisma.UserCreateInput) => createUser({ user, db }),
    updateUser: updateUser({ db }),
    deleteUser: deleteUser({ db }),
    subscribe: subscribe({ db }),
    getUserSubscriptions: getUserSubscriptions({ db }),
    getAllUsers: getAllUsers({ db }),
  }
}

export default makeUserRepo
