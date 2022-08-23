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
    })
  }

const getUserAndCardById =
  ({ db }: { db: PrismaClient }) =>
  (userId: number) => {
    return db.user.findUnique({
      where: {
        userId,
      },
      include: {
        card: true,
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

const getUserDetails =
  ({ db }: { db: PrismaClient }) =>
  async ({ userId }: { userId?: number }) => {
    const [totalBookings, subscriptions, averageRatings, amountSpent, user] =
      await db.$transaction([
        db.booking.count({
          where: {
            userId,
          },
        }),
        db.subscription.count({
          where: {
            userId,
          },
        }),
        db.booking.aggregate({
          where: {
            userId,
          },
          _avg: {
            rating: true,
          },
        }),
        db.invoiceFees.aggregate({
          _sum: {
            price: true,
          },
          where: {
            invoice: { booking: { userId }, paid: true },
          },
        }),
        db.user.findFirst({ where: { userId } }),
      ])

    return {
      totalBookings,
      subscriptions,
      averageRatings: averageRatings._avg.rating,
      amountSpent: amountSpent._sum.price,
      user,
    }
  }

const getUserData =
  ({ db }: { db: PrismaClient }) =>
  ({ userId }: { userId: number }) => {
    return db.user.findUnique({
      where: {
        userId,
      },
      include: {
        card: true,
      },
    })
  }

const getCard =
  ({ db }: { db: PrismaClient }) =>
  async ({ userId }: { userId: number }) => {
    const card = await db.user.findUnique({
      where: {
        userId,
      },
      select: {
        userId: true,
        card: true,
      },
    })
    if (!card) return card
    return card.card
  }

const deleteCard =
  ({ db }: { db: PrismaClient }) =>
  ({ cardId }: { cardId: number }) =>
    db.card.delete({
      where: {
        cardId,
      },
    })

const makeUserRepo = ({ db }: { db: PrismaClient }) => {
  return {
    getUserById: getUserById({ db }),
    getUserAndCardById: getUserAndCardById({ db }),
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
    getUserDetails: getUserDetails({ db }),
    getUserData: getUserData({ db }),
    getCard: getCard({ db }),
    deleteCard: deleteCard({ db }),
  }
}

export default makeUserRepo
