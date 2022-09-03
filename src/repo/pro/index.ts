import { Prisma, PrismaClient, SubService, User } from '@prisma/client'
import {
  BOOKING_STATUS,
  PERIODIC_CASH_AMOUNTS,
  ROLES,
} from '../../config/constants'
import { PageReq } from '../../schemas/request/Page'
import { dayjs } from '../../utils'

const getDistBtwLoctions =
  ({ db }: { db: PrismaClient }) =>
  async ({
    latitude,
    longitude,
    proId,
  }: {
    longitude: number
    latitude: number
    proId: number
  }) => {
    // TODO: convert latlng to POINT and add SPATIAL INDEX
    const r = await db.$queryRaw`
    SELECT ST_distance_sphere(
              POINT(longitude, latitude),
              POINT(${longitude}, ${latitude})
          ) AS distance
    FROM User
    WHERE userId = ${proId}
    `
    return (
      r as {
        distance: number
      }[]
    )?.[0]?.distance
  }
const getNearestPro =
  ({ db }: { db: PrismaClient }) =>
  async ({
    latitude,
    longitude,
    subServiceId,
    distance,
    userId,
  }: {
    longitude: number
    latitude: number
    subServiceId: number
    distance?: number
    userId?: number
  }) => {
    // TODO: convert latlng to POINT and add SPATIAL INDEX
    const result: {
      userId: User['userId']
      businessName: User['businessName']
      proName: User['name']
      address: User['address']
      available: User['available']
      serviceName: SubService['name']
      price?: SubService['price']
      distance?: number
    }[] = await db.$queryRaw`
    SELECT * FROM (SELECT
    u.userId,
    u.businessName,
    u.name proName,
    u.available,
    ss.name serviceName,
    u.address,
    ss.price,
    ss.subServiceId,
            u.role,
            longitude,
            latitude, (
        ST_distance_sphere(
            POINT(longitude, latitude),
            POINT(${longitude}, ${latitude})
        )
    ) AS distance
FROM User as u
    INNER JOIN ProService us ON u.userId = us.proId
    INNER JOIN subService ss ON us.serviceId = ss.serviceId) as sub
WHERE
    subServiceId = ${subServiceId}
    ${
      distance
        ? Prisma.sql`AND distance >= ${distance}
    AND ( distance > ${distance} 
      ${userId ? Prisma.sql`OR userId > ${userId}` : Prisma.empty}
     )`
        : Prisma.empty
    }
    AND longitude IS NOT NULL
    AND latitude IS NOT NULL
    AND available = 1
ORDER BY distance, userId ASC LIMIT 1;`

    if (result.length) {
      result[0].available = !!result[0].available
    }

    return result?.[0]
  }

// MULTI-CURSOR PAGINATION
//WHERE t.Column_1 >= :lrv_col1
// AND ( t.Column_1 > :lrv_col1 OR t.Column_2 > :lrv_col2 )
// ORDER BY t.Column_1, t.Column_2
// LIMIT n

// MULTI-CURSOR PAGINATION POSTGRES
// and ((`Month` >= 10 AND `Year` = 2012)
// OR (`Month` <= 2 AND `Year` = 2013))

const getPayoutRequests =
  ({ db }: { db: PrismaClient }) =>
  (page: PageReq & { skip: number }) =>
    db.user.findMany({
      take: page.perPage,
      skip: page.skip,
    })

const getPayoutRequestsWP =
  ({ db }: { db: PrismaClient }) =>
  (page: PageReq & { skip: number }) =>
    db.invoice.findMany({
      take: page.perPage,
      skip: page.skip,
      where: {
        paid: {
          not: true,
        },
      },
      include: {
        invoiceFees: true,
      },
    })

const getProSubscribers =
  ({ db }: { db: PrismaClient }) =>
  (proId: number) =>
    db.subscription.findMany({
      where: {
        proId,
      },
      include: {
        users: {
          select: {
            userId: true,
            profilePhotoUrl: true,
            name: true,
          },
        },
      },
    })

const getProServices =
  ({ db }: { db: PrismaClient }) =>
  (proId: number) =>
    db.service.findFirst({
      where: {
        proServices: {
          some: {
            proId,
          },
        },
      },
      include: {
        subServices: true,
      },
    })

const getAllPros =
  ({ db }: { db: PrismaClient }) =>
  ({
    serviceId,
    name,
  }: PageReq & { skip: number } & { serviceId?: number; name?: string }) => {
    const where = {
      role: ROLES.PRO,
      proServices: {
        some: {
          serviceId,
        },
      },
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

const getProDetails =
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
      user,
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

const getProData =
  ({ db }: { db: PrismaClient }) =>
  ({ proId }: { proId: number }) => {
    return db.user.findUnique({
      where: {
        userId: proId,
      },
      include: {
        account: true,
      },
    })
  }

const searchPro =
  ({ db }: { db: PrismaClient }) =>
  ({ name }: { name: string }) => {
    return db.user.findMany({
      where: {
        OR: [
          {
            name: {
              contains: name,
            },
          },
          {
            businessName: {
              contains: name,
            },
          },
        ],
      },
    })
  }

const getProApplications =
  ({ db }: { db: PrismaClient }) =>
  () =>
    db.user.findMany({
      where: {
        verified: {
          not: true,
        },
        role: ROLES.PRO,
      },
    })

const updateAvailability =
  ({ db }: { db: PrismaClient }) =>
  (proId: number, available: boolean) =>
    db.available.create({
      data: {
        proId,
        available,
      },
    })

const makeProRepo = ({ db }: { db: PrismaClient }) => {
  return {
    getNearestPro: getNearestPro({ db }),
    getDistBtwLoctions: getDistBtwLoctions({ db }),
    getPayoutRequests: getPayoutRequests({ db }),
    getPayoutRequestsWP: getPayoutRequestsWP({ db }),
    getProSubscribers: getProSubscribers({ db }),
    getProServices: getProServices({ db }),
    getAllPros: getAllPros({ db }),
    getProDetails: getProDetails({ db }),
    getProData: getProData({ db }),
    searchPro: searchPro({ db }),
    getProApplications: getProApplications({ db }),
    updateAvailability: updateAvailability({ db }),
  }
}

export default makeProRepo
