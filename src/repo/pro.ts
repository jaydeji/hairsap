import { Prisma, PrismaClient, Pro, SubService } from '@prisma/client'
import { PageReq } from '../schemas/request/Page'

const getProById =
  ({ db }: { db: PrismaClient }) =>
  (proId: number) => {
    return db.pro.findUnique({
      where: {
        proId,
      },
      include: {
        devices: true,
        otp: true,
      },
    })
  }

const getProByEmail =
  ({ db }: { db: PrismaClient }) =>
  (email: string) => {
    return db.pro.findUnique({
      where: {
        email,
      },
      include: {
        devices: true,
      },
    })
  }

const createPro =
  ({ db }: { db: PrismaClient }) =>
  (user: Prisma.UserCreateInput) =>
    db.user.create({ data: user })

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
  FROM Users
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
    proId,
  }: {
    longitude: number
    latitude: number
    subServiceId: number
    distance?: number
    proId?: number
  }) => {
    // TODO: convert latlng to POINT and add SPATIAL INDEX
    const r = await db.$queryRaw`
    SELECT * FROM (SELECT
    u.proId,
    u.businessName,
    u.name proName,
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
FROM Pro as u
    INNER JOIN ProService us ON u.proId = us.proId
    INNER JOIN subService ss ON us.serviceId = ss.serviceId) as sub
WHERE
    subServiceId = ${subServiceId}
    ${
      distance
        ? Prisma.sql`AND distance >= ${distance}
    AND ( distance > ${distance} 
      ${proId ? Prisma.sql`OR proId > ${proId}` : Prisma.empty}
     )`
        : Prisma.empty
    }
    AND longitude IS NOT NULL
    AND latitude IS NOT NULL
ORDER BY distance, proId ASC LIMIT 1;`

    return (
      r as {
        proId: Pro['proId']
        businessName: Pro['businessName']
        proName: Pro['name']
        address: Pro['address']
        serviceName: SubService['name']
        price?: SubService['price']
        distance?: number
      }[]
    )?.[0]
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
    db.pro.findMany({
      take: page.perPage,
      skip: page.skip,
    })

const getPayoutRequestsWP =
  ({ db }: { db: PrismaClient }) =>
  (page: PageReq & { skip: number }) =>
    db.$transaction([
      db.pro.count({}),
      db.pro.findMany({
        take: page.perPage,
        skip: page.skip,
      }),
    ])

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

const updatePro =
  ({ db }: { db: PrismaClient }) =>
  (proId: number, pro: Prisma.ProUpdateInput) =>
    db.pro.update({
      data: pro,
      where: {
        proId,
      },
    })

const makeProRepo = ({ db }: { db: PrismaClient }) => {
  return {
    getProById: getProById({ db }),
    getProByEmail: getProByEmail({ db }),
    getNearestPro: getNearestPro({ db }),
    getDistBtwLoctions: getDistBtwLoctions({ db }),
    getPayoutRequests: getPayoutRequests({ db }),
    getPayoutRequestsWP: getPayoutRequestsWP({ db }),
    getProSubscribers: getProSubscribers({ db }),
    updatePro: updatePro({ db }),
    createPro: createPro({ db }),
  }
}

export default makeProRepo
