import { Prisma, PrismaClient } from '@prisma/client'
import { BOOKING_STATUS, ROLES } from '../config/constants'
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
      include: {
        deactivations: true,
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
      include: {
        deactivations: true,
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
}) => db.user.create({ data: user, include: { deactivations: true } })

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

const getSubscription =
  ({ db }: { db: PrismaClient }) =>
  ({ userId, proId }: PostSubscribeReq) =>
    db.subscription.findUnique({
      where: {
        userId_proId: {
          proId,
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

const unsubscribe =
  ({ db }: { db: PrismaClient }) =>
  ({ userId, proId }: PostSubscribeReq) =>
    db.subscription.delete({
      where: {
        userId_proId: {
          proId,
          userId,
        },
      },
    })

const getUserSubscriptions =
  ({ db }: { db: PrismaClient }) =>
  async (userId: number) => {
    const subscriptions = await db.subscription.findMany({
      where: {
        userId,
      },
      include: {
        pro: {
          select: {
            userId: true,
            profilePhotoUrl: true,
            name: true,
            businessName: true,
            _count: {
              select: {
                proBookings: {
                  where: {
                    status: BOOKING_STATUS.COMPLETED,
                    rating: {
                      not: null,
                    },
                  },
                },
              },
            },
          },
        },
      },
    })

    const ratings = await db.booking.groupBy({
      by: ['proId'],
      _avg: {
        rating: true,
      },
      where: {
        proId: { in: subscriptions.map((e) => e.proId) },
        rating: { not: null },
      },
    })

    return subscriptions.map((sub) => ({
      ...sub,
      pro: {
        userId: sub.pro.userId,
        profilePhotoUrl: sub.pro.profilePhotoUrl,
        name: sub.pro.name,
        businessName: sub.pro.businessName,
        count: sub.pro._count.proBookings,
        rating: ratings.find((e) => e.proId === sub.pro.userId)?._avg || 0,
      },
    }))
  }

const getAllUsers =
  ({ db }: { db: PrismaClient }) =>
  ({ name }: PageReq & { skip: number } & { name?: string }) => {
    const where = {
      role: ROLES.USER,
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
        select: {
          address: true,
          userId: true,
          createdAt: true,
          email: true,
          phone: true,
          profilePhotoUrl: true,
          faceIdPhotoUrl: true,
          name: true,
          verified: true,
        },
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
        db.user.findFirst({
          where: { userId },
          select: {
            name: true,
            userId: true,
            profilePhotoUrl: true,
            faceIdPhotoUrl: true,
            email: true,
            createdAt: true,
            verified: true,
            phone: true,
            address: true,
          },
        }),
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
      select: {
        userId: true,
        email: true,
        address: true,
        name: true,
        phone: true,
        role: true,
        profilePhotoUrl: true,
        faceIdPhotoUrl: true,
        verified: true,
        card: {
          select: {
            bank: true,
            brand: true,
            cardId: true,
            createdAt: true,
            expiryMonth: true,
            email: true,
            expiryYear: true,
            last4: true,
          },
        },
      },
    })
  }

const getCard =
  ({ db }: { db: PrismaClient }) =>
  async ({ userId }: { userId: number }) => {
    const card = await db.card.findUnique({
      where: {
        userId,
      },
      select: {
        bank: true,
        brand: true,
        cardId: true,
        createdAt: true,
        expiryMonth: true,
        email: true,
        expiryYear: true,
        last4: true,
      },
    })
    return card
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
    getSubscription: getSubscription({ db }),
    subscribe: subscribe({ db }),
    unsubscribe: unsubscribe({ db }),
    getUserSubscriptions: getUserSubscriptions({ db }),
    getAllUsers: getAllUsers({ db }),
    getUserDetails: getUserDetails({ db }),
    getUserData: getUserData({ db }),
    getCard: getCard({ db }),
    deleteCard: deleteCard({ db }),
  }
}

export default makeUserRepo
