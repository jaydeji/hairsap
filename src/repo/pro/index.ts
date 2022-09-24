import { Prisma, PrismaClient, SubService, User } from '@prisma/client'
import { BOOKING_STATUS, CHANNEL, ROLES } from '../../config/constants'
import { Cursor } from '../../schemas/models/Cursor'
import { PageReq } from '../../schemas/request/Page'
import { getProBookingRatio } from './getProBookingRatio'
import { getProDetails } from './getProDetails'
import { getProStats } from './getProStats'

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
    INNER JOIN SubService ss ON us.serviceId = ss.serviceId) as sub
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
        channel: CHANNEL.CASH,
        booking: {
          status: BOOKING_STATUS.COMPLETED,
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
        user: {
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
        select: {
          name: true,
          phone: true,
          businessName: true,
          email: true,
          userId: true,
          deactivated: true,
          createdAt: true,
          profilePhotoUrl: true,
        },
      }),
    ])
  }

const getProData =
  ({ db }: { db: PrismaClient }) =>
  ({ proId }: { proId: number }) => {
    return db.user.findUnique({
      where: {
        userId: proId,
      },
      select: {
        userId: true,
        email: true,
        address: true,
        name: true,
        phone: true,
        role: true,
        profilePhotoUrl: true,
        deactivated: true,
        deactivationCount: true,
        reactivationCount: true,
        reactivationRequested: true,
        terminated: true,
        available: true,
        businessName: true,
        account: true,
      },
    })
  }

const searchPro =
  ({ db }: { db: PrismaClient }) =>
  async ({ name }: { name: string }) => {
    const users = await db.user.findMany({
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
        role: ROLES.PRO,
      },
      select: {
        name: true,
        businessName: true,
        userId: true,
        profilePhotoUrl: true,
        proServices: {
          select: {
            service: {
              select: {
                name: true,
                photoUrl: true,
                serviceId: true,
              },
            },
          },
        },
      },
    })

    return users.map((user) => ({
      name: user.name,
      businessName: user.businessName,
      userId: user.userId,
      profilePhotoUrl: user.profilePhotoUrl,
      service: user.proServices?.[0]?.service,
    }))
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
      select: {
        userId: true,
        name: true,
        proServices: {
          select: {
            service: {
              select: {
                name: true,
              },
            },
          },
        },
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

const getApplicationVideo =
  ({ db }: { db: PrismaClient }) =>
  (proId: number) =>
    db.user.findUnique({
      where: {
        userId: proId,
      },
      include: {
        proServices: true,
      },
    })

const getProInfo =
  ({ db }: { db: PrismaClient }) =>
  async (proId: number) => {
    const [user, rating, bookings, subscribers] = await db.$transaction([
      db.user.findFirst({
        where: {
          userId: proId,
          role: ROLES.PRO,
        },
        select: {
          name: true,
          profilePhotoUrl: true,
          proServices: true,
        },
      }),
      db.booking.aggregate({
        where: {
          pro: {
            userId: proId,
            role: ROLES.PRO,
          },
        },
        _avg: {
          rating: true,
        },
      }),
      db.booking.count({
        where: {
          pro: {
            userId: proId,
            role: ROLES.PRO,
          },
          status: BOOKING_STATUS.COMPLETED,
        },
      }),
      db.subscription.count({
        where: {
          pro: {
            userId: proId,
            role: ROLES.PRO,
          },
        },
      }),
    ])
    if (!user) return

    return {
      user: {
        name: user.name,
        profilePhotoUrl: user.profilePhotoUrl,
        service: user.proServices[0],
      },
      bookings,
      rating: rating._avg.rating,
      subscribers,
    }
  }

const getProReviews =
  ({ db }: { db: PrismaClient }) =>
  ({
    proId,
    cursor,
    take = 20,
    desc = false,
  }: {
    proId: number
  } & Cursor) =>
    db.booking.findMany({
      take: desc ? -take : take,
      skip: 1,
      cursor: cursor
        ? {
            bookingId: cursor,
          }
        : undefined,
      where: {
        proId,
        status: BOOKING_STATUS.COMPLETED,
        rating: {
          not: null,
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
      select: {
        bookingId: true,
        rating: true,
        review: true,
        createdAt: true,
        user: {
          select: {
            name: true,
          },
        },
      },
    })

const getProAccount =
  ({ db }: { db: PrismaClient }) =>
  (userId: number) =>
    db.account.findUnique({
      where: {
        userId,
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
    getApplicationVideo: getApplicationVideo({ db }),
    getProStats: getProStats({ db }),
    getProBookingRatio: getProBookingRatio({ db }),
    getProInfo: getProInfo({ db }),
    getProReviews: getProReviews({ db }),
    getProAccount: getProAccount({ db }),
  }
}

export default makeProRepo
