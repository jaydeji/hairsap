import { Prisma, PrismaClient } from '@prisma/client'
import { BOOKING_STATUS } from '../config/constants'
import { dayjs } from '../utils'

const dbHealthCheck =
  ({ db }: { db: PrismaClient }) =>
  () =>
    db.$queryRaw`SELECT 1`

const getServices =
  ({ db }: { db: PrismaClient }) =>
  () =>
    db.service.findMany({
      include: {
        subServices: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    })

const getSubServiceById =
  ({ db }: { db: PrismaClient }) =>
  (subServiceId: number) =>
    db.subService.findUnique({
      where: {
        subServiceId,
      },
    })

const getNotifications =
  ({ db }: { db: PrismaClient }) =>
  (userId: number) =>
    db.notification.findMany({
      take: 40,
      orderBy: {
        createdAt: 'desc',
      },
      where: {
        userId,
      },
    })

const getNotificationStatusByPeriod =
  ({ db }: { db: PrismaClient }) =>
  ({
    userId,
    period,
    type,
  }: {
    userId: number
    type: string
    period: 'week' | 'day'
  }) =>
    db.notificationTracker.findFirst({
      where: {
        userId,
        createdAt: { gte: dayjs().startOf(period).toDate() },
        type,
      },
    })

const getNotificationStatus =
  ({ db }: { db: PrismaClient }) =>
  ({ userId, type }: { userId: number; type: string }) =>
    db.notificationTracker.findFirst({
      where: {
        userId,
        type,
      },
    })

const addNotificationStatus =
  ({ db }: { db: PrismaClient }) =>
  ({ userId, type }: { userId: number; type: string }) =>
    db.notificationTracker.create({
      data: {
        userId,
        type,
      },
    })

const createNotification =
  ({ db }: { db: PrismaClient }) =>
  ({
    userId,
    body,
    title,
  }: {
    userId: number
    body?: string
    title?: string
  }) =>
    db.notification.create({
      data: {
        body,
        title,
        userId,
      },
    })

const setPushToken =
  ({ db }: { db: PrismaClient }) =>
  ({ userId, pushToken }: { userId: number; pushToken: string }) =>
    db.user.update({
      where: {
        userId,
      },
      data: {
        pushToken,
      },
    })

const getPushToken =
  ({ db }: { db: PrismaClient }) =>
  ({ userId }: { userId: number }) =>
    db.user.findUnique({
      where: {
        userId,
      },
      select: {
        pushToken: true,
      },
    })

const deactivateUserOrPro =
  ({ db }: { db: PrismaClient }) =>
  async (body: { userId: number }) => {
    const userOpt = { where: { userId: body.userId } }
    const user = await db.user.findFirst({
      where: userOpt.where,
      include: {
        account: true,
        card: true,
        deactivations: true,
        paymentEvents: true,
        proBookings: true,
        bonuses: true,
      },
    })
    if (!user) return
    await db.deactivatedUser.create({
      data: {
        data: JSON.parse(JSON.stringify(user)),
        deactivatedUserId: user?.userId,
      },
    })
    return db.user.delete(userOpt)
  }

const addMarketer =
  ({ db }: { db: PrismaClient }) =>
  (body: { name: string }) => {
    return db.marketer.create({ data: body })
  }

const getDiscounts =
  ({ db }: { db: PrismaClient }) =>
  () => {
    return db.discount.findMany()
  }

const getDiscountById =
  ({ db }: { db: PrismaClient }) =>
  (discountId: number) => {
    return db.discount.findUnique({ where: { discountId } })
  }

const getPromoByCode =
  ({ db }: { db: PrismaClient }) =>
  (code: string) => {
    return db.promo.findUnique({
      where: {
        code,
      },
    })
  }

const createPromo =
  ({ db }: { db: PrismaClient }) =>
  (body: { marketerId: number; discountId: number; code: string }) => {
    return db.promo.create({
      data: {
        active: true,
        code: body.code,
        discount: {
          connect: {
            discountId: body.discountId,
          },
        },
        Marketer: {
          connect: {
            marketerId: body.marketerId,
          },
        },
      },
    })
  }

const updatePromo =
  ({ db }: { db: PrismaClient }) =>
  (body: { promoId: number; active?: boolean; discountId?: number }) => {
    db.promo.update({
      data: {
        active: body.active,
        discountId: body.discountId,
      },
      where: {
        promoId: body.promoId,
      },
    })
  }

const getAllMarketers =
  ({ db }: { db: PrismaClient }) =>
  () =>
    db.marketer.findMany()

const getMarketerPromos =
  ({ db }: { db: PrismaClient }) =>
  (marketerId: number) => {
    return db.promo.findMany({
      where: {
        marketerId,
      },
    })
  }

const getMarketerStats =
  ({ db }: { db: PrismaClient }) =>
  () =>
    db.$queryRaw<
      {
        promoId: number
        code: string
        marketerName: string
        discountName: string
        bookingCnt: number
        completedBookingCnt: string
      }[]
    >`
  SELECT
    p.promoId,
    code,
    m.name marketerName,
    d.name discountName,
    COUNT(p.promoId) bookingCnt,
    SUM(
        CASE b.status
            WHEN 'completed' THEN 1
            ELSE 0
        END
    ) completedBookingCnt
    FROM Promo p
        LEFT JOIN Marketer m ON p.marketerId = m.marketerId
        LEFT JOIN Discount d ON p.discountId = d.discountId
        LEFT JOIN Invoice i ON i.promoId = p.promoId
        LEFT JOIN Booking b ON b.bookingId = i.bookingId
    GROUP BY p.promoId;
  `

const getMarketerAggregate =
  ({ db }: { db: PrismaClient }) =>
  async () => {
    const [
      marketersCount,
      marketersCompletedBookingCount,
      marketersCompletedBookingTotal,
    ] = await db.$transaction([
      db.marketer.count(),
      db.booking.count({
        where: {
          invoice: { promoId: { not: null } },
          status: BOOKING_STATUS.COMPLETED,
        },
      }),
      db.invoiceFees.aggregate({
        _sum: {
          price: true,
        },
        where: {
          invoice: {
            promoId: { not: null },
            booking: {
              status: BOOKING_STATUS.COMPLETED,
            },
          },
        },
      }),
    ])

    return {
      marketersCount,
      marketersCompletedBookingCount,
      marketersCompletedBookingTotal:
        marketersCompletedBookingTotal._sum.price || 0,
    }
  }

const getMarketerStatsById =
  ({ db }: { db: PrismaClient }) =>
  async (marketerId: number) => {
    const [
      monthlyBookingsCount,
      monthlyCompletedBookingsCount,
      monthlyCompletedBookingsTotal,
    ] = await db.$transaction([
      db.booking.count({
        where: {
          createdAt: {
            gte: dayjs().startOf('month').toDate(),
          },
          invoice: {
            promo: {
              marketerId,
            },
          },
        },
      }),
      db.booking.count({
        where: {
          createdAt: {
            gte: dayjs().startOf('month').toDate(),
          },
          invoice: {
            promo: {
              marketerId,
            },
          },
          status: BOOKING_STATUS.COMPLETED,
        },
      }),
      db.invoiceFees.aggregate({
        _sum: {
          price: true,
        },
        where: {
          invoice: {
            promo: { marketerId },
            booking: {
              status: BOOKING_STATUS.COMPLETED,
              createdAt: {
                gte: dayjs().startOf('month').toDate(),
              },
            },
          },
        },
      }),
    ])
    return {
      monthlyBookingsCount,
      monthlyCompletedBookingsCount,
      monthlyCompletedBookingsTotal:
        monthlyCompletedBookingsTotal._sum.price || 0,
    }
  }

const getBookingByPromo =
  ({ db }: { db: PrismaClient }) =>
  (code: string, userId: number) => {
    return db.invoice.findFirst({
      where: {
        booking: {
          userId,
        },
        promo: {
          code,
        },
      },
    })
  }

const markNotificationAsRead =
  ({ db }: { db: PrismaClient }) =>
  (userId: number, notificationId: number) => {
    return db.notification.update({
      where: {
        notificationId,
      },
      data: {
        read: true,
      },
    })
  }

const getNotificationsById =
  ({ db }: { db: PrismaClient }) =>
  (notificationId: number) => {
    return db.notification.findFirst({
      where: {
        notificationId,
      },
    })
  }

const addBullIds =
  ({ db }: { db: PrismaClient }) =>
  (data: Prisma.BullIdsCreateManyInput[]) => {
    return db.bullIds.createMany({
      data,
    })
  }

const getBullIds =
  ({ db }: { db: PrismaClient }) =>
  (where: Prisma.BullIdsWhereInput) => {
    return db.bullIds.findMany({ where })
  }

const deleteBullIds =
  ({ db }: { db: PrismaClient }) =>
  (where: Prisma.BullIdsWhereInput) => {
    return db.bullIds.deleteMany({ where })
  }

const makeOtherRepo = ({ db }: { db: PrismaClient }) => {
  return {
    getServices: getServices({ db }),
    getSubServiceById: getSubServiceById({ db }),
    getNotifications: getNotifications({ db }),
    getNotificationStatus: getNotificationStatus({ db }),
    getNotificationStatusByPeriod: getNotificationStatusByPeriod({ db }),
    addNotificationStatus: addNotificationStatus({ db }),
    createNotification: createNotification({ db }),
    setPushToken: setPushToken({ db }),
    getPushToken: getPushToken({ db }),
    dbHealthCheck: dbHealthCheck({ db }),
    deactivateUserOrPro: deactivateUserOrPro({ db }),
    addMarketer: addMarketer({ db }),
    getDiscounts: getDiscounts({ db }),
    getDiscountById: getDiscountById({ db }),
    createPromo: createPromo({ db }),
    updatePromo: updatePromo({ db }),
    getPromoByCode: getPromoByCode({ db }),
    getAllMarketers: getAllMarketers({ db }),
    getMarketerPromos: getMarketerPromos({ db }),
    getMarketerStatsById: getMarketerStatsById({ db }),
    getBookingByPromo: getBookingByPromo({ db }),
    getMarketerStats: getMarketerStats({ db }),
    getMarketerAggregate: getMarketerAggregate({ db }),
    markNotificationAsRead: markNotificationAsRead({ db }),
    getNotificationsById: getNotificationsById({ db }),
    addBullIds: addBullIds({ db }),
    getBullIds: getBullIds({ db }),
    deleteBullIds: deleteBullIds({ db }),
  }
}

export default makeOtherRepo
