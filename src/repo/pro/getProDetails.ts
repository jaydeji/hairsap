import { PrismaClient } from '@prisma/client'
import { BOOKING_STATUS, PERIODIC_CASH_AMOUNTS } from '../../config/constants'
import { dayjs } from '../../utils'

const getStarRatings = async ({
  db,
  proId,
}: {
  db: PrismaClient
  proId: number
}) => {
  const starRatings = await db.booking.aggregate({
    where: {
      rating: 5,
      proId,
      status: BOOKING_STATUS.COMPLETED,
    },
    _count: {
      rating: true,
    },
  })

  return starRatings._count.rating > 5 ? 5 : starRatings._count.rating
}

const getTotalEarnings = async ({
  db,
  proId,
}: {
  db: PrismaClient
  proId: number
}) => {
  const [
    totalDayTransport,
    totalWeekInvoiceFees,
    totalMonthTransport,
    totalDayInvoiceFees,
    totalWeekTransport,
    totalMonthInvoiceFees,
  ] = await db.$transaction([
    db.invoice.aggregate({
      where: {
        booking: {
          proId,
          status: BOOKING_STATUS.COMPLETED,
          createdAt: {
            gte: dayjs().startOf('day').toDate(),
          },
        },
      },
      _sum: {
        transportFee: true,
      },
    }),
    db.invoiceFees.aggregate({
      where: {
        invoice: {
          booking: {
            proId,
            status: BOOKING_STATUS.COMPLETED,
            createdAt: {
              gte: dayjs().startOf('day').toDate(),
            },
          },
        },
      },
      _sum: {
        price: true,
      },
    }),
    db.invoice.aggregate({
      where: {
        booking: {
          proId,
          status: BOOKING_STATUS.COMPLETED,
          createdAt: {
            gte: dayjs().startOf('week').toDate(),
          },
        },
      },
      _sum: {
        transportFee: true,
      },
    }),
    db.invoiceFees.aggregate({
      where: {
        invoice: {
          booking: {
            proId,
            status: BOOKING_STATUS.COMPLETED,
            createdAt: {
              gte: dayjs().startOf('week').toDate(),
            },
          },
        },
      },
      _sum: {
        price: true,
      },
    }),
    db.invoice.aggregate({
      where: {
        booking: {
          proId,
          status: BOOKING_STATUS.COMPLETED,
          createdAt: {
            gte: dayjs().startOf('month').toDate(),
          },
        },
      },
      _sum: {
        transportFee: true,
      },
    }),
    db.invoiceFees.aggregate({
      where: {
        invoice: {
          booking: {
            proId,
            status: BOOKING_STATUS.COMPLETED,
            createdAt: {
              gte: dayjs().startOf('month').toDate(),
            },
          },
        },
      },
      _sum: {
        price: true,
      },
    }),
  ])

  return {
    day:
      (totalDayTransport._sum.transportFee || 0) +
      (totalDayInvoiceFees._sum.price || 0),
    week:
      (totalWeekTransport._sum.transportFee || 0) +
      (totalWeekInvoiceFees._sum.price || 0),
    month:
      (totalMonthTransport._sum.transportFee || 0) +
      (totalMonthInvoiceFees._sum.price || 0),
  }
}

export const getProDetails =
  ({ db }: { db: PrismaClient }) =>
  async ({ proId }: { proId: number }) => {
    const [
      latestBookings,
      dailyBookingSum,
      dailyBookingCount,
      weeklyBookingSum,
      weeklyBookingCount,
      monthlyBookingSum,
      monthlyBookingCount,
      allBookingSum,
      allBookingCount,
      subscriptions,
      averageRatings,
      user,
      dailyTaskTarget,
      weeklyTaskTarget,
      monthlyTaskTarget,
      dailyBonus,
      weeklyBonus,
      monthlyBonus,
    ] = await db.$transaction([
      db.booking.findMany({
        where: {
          proId,
          createdAt: { gte: dayjs().startOf('day').toDate() },
        },
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          bookedSubServices: {
            select: {
              subService: true,
            },
          },
        },
      }),
      db.invoiceFees.aggregate({
        _sum: {
          price: true,
        },
        where: {
          invoice: { booking: { proId } },
          createdAt: {
            gte: dayjs().startOf('date').toDate(),
          },
        },
      }),
      db.booking.count({
        where: {
          proId,
          createdAt: {
            gte: dayjs().startOf('date').toDate(),
          },
        },
      }),
      db.invoiceFees.aggregate({
        _sum: {
          price: true,
        },
        where: {
          invoice: { booking: { proId } },
          createdAt: {
            gte: dayjs().startOf('week').toDate(),
          },
        },
      }),
      db.booking.count({
        where: {
          proId,
          createdAt: {
            gte: dayjs().startOf('week').toDate(),
          },
        },
      }),
      db.invoiceFees.aggregate({
        _sum: {
          price: true,
        },
        where: {
          invoice: { booking: { proId } },
          createdAt: {
            gte: dayjs().startOf('month').toDate(),
          },
        },
      }),
      db.booking.count({
        where: {
          proId,
          createdAt: {
            gte: dayjs().startOf('month').toDate(),
          },
        },
      }),
      db.invoiceFees.aggregate({
        _sum: {
          price: true,
        },
        where: {
          invoice: { booking: { proId } },
        },
      }),
      db.booking.count({
        where: {
          proId,
        },
      }),
      db.subscription.count({
        where: {
          proId: proId,
        },
      }),
      db.booking.aggregate({
        where: {
          proId,
        },
        _avg: {
          rating: true,
        },
      }),
      db.user.findFirst({
        where: { userId: proId },
        include: {
          account: true,
          proServices: {
            where: {
              proId,
            },
            include: {
              service: true,
            },
          },
        },
      }),
      db.invoiceFees.aggregate({
        where: {
          invoice: {
            booking: {
              proId,
              status: BOOKING_STATUS.COMPLETED,
              createdAt: {
                gte: dayjs().startOf('day').toDate(),
              },
            },
          },
        },
        _sum: {
          price: true,
        },
      }),
      db.invoiceFees.aggregate({
        where: {
          invoice: {
            booking: {
              proId,
              status: BOOKING_STATUS.COMPLETED,
              createdAt: {
                gte: dayjs().startOf('week').toDate(),
              },
            },
          },
        },
        _sum: {
          price: true,
        },
      }),
      db.invoiceFees.aggregate({
        where: {
          invoice: {
            booking: {
              proId,
              status: BOOKING_STATUS.COMPLETED,
              createdAt: {
                gte: dayjs().startOf('month').toDate(),
              },
            },
          },
        },
        _sum: {
          price: true,
        },
      }),
      db.bonus.aggregate({
        where: {
          proId,
          createdAt: {
            gte: dayjs().startOf('day').toDate(),
          },
        },
        _sum: {
          amount: true,
        },
      }),
      db.bonus.aggregate({
        where: {
          proId,
          createdAt: {
            gte: dayjs().startOf('week').toDate(),
          },
        },
        _sum: {
          amount: true,
        },
      }),
      db.bonus.aggregate({
        where: {
          proId,
          createdAt: {
            gte: dayjs().startOf('month').toDate(),
          },
        },
        _sum: {
          amount: true,
        },
      }),
    ])

    const earnings = await getTotalEarnings({ db, proId })
    const ratings = await getStarRatings({ db, proId })

    return {
      latestBookings,
      dailyBookingCount,
      dailyBookingSum: dailyBookingSum._sum.price,
      weeklyBookingCount,
      weeklyBookingSum: weeklyBookingSum._sum.price,
      monthlyBookingCount,
      monthlyBookingSum: monthlyBookingSum._sum.price,
      allBookingCount,
      allBookingSum: allBookingSum._sum.price,
      subscriptions,
      averageRatings: averageRatings._avg.rating,
      user: {
        userId: user?.userId,
        email: user?.email,
        address: user?.address,
        name: user?.name,
        phone: user?.phone,
        role: user?.role,
        profilePhotoUrl: user?.profilePhotoUrl,
        deactivated: user?.deactivated,
        deactivationCount: user?.deactivationCount,
        reactivationCount: user?.reactivationCount,
        reactivationRequested: user?.reactivationRequested,
        terminated: user?.terminated,
        verified: user?.verified,
        available: user?.available,
        businessName: user?.businessName,
        createdAt: user?.createdAt,
        account: user?.account,
        proServices: user?.proServices,
      },
      ratings,
      taskTarget: {
        day:
          ((dailyTaskTarget._sum.price || 0) /
            PERIODIC_CASH_AMOUNTS.DAILY_TASK_TARGET) *
          100,
        week:
          ((weeklyTaskTarget._sum.price || 0) /
            PERIODIC_CASH_AMOUNTS.WEEKLY_TASK_TARGET) *
          100,
        month:
          ((monthlyTaskTarget._sum.price || 0) /
            PERIODIC_CASH_AMOUNTS.MONTHLY_TASK_TARGET) *
          100,
      },
      bonus: {
        day: dailyBonus._sum.amount,
        week: weeklyBonus._sum.amount,
        month: monthlyBonus._sum.amount,
      },
      earnings,
    }
  }
