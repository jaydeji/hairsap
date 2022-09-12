import { Prisma, PrismaClient, PrismaPromise } from '@prisma/client'
import { Dayjs } from 'dayjs'
import { GetProBookingRatioReq } from '../../schemas/request/getProBookingRatio'
import { dayjs } from '../../utils'

const getWeekTotalBookingRatio = ({
  db,
  proId,
  having,
}: {
  db: PrismaClient
  proId: number
  having: Prisma.Sql
}) => {
  const week = dayjs().startOf('w').toDate()
  return db.$queryRaw`
SELECT COUNT(DISTINCT b.userId) cnt
FROM (
        SELECT
            userId,
            COUNT(userId) cnt
        FROM Booking b
        WHERE
            b.status = 'completed'
            and proId = ${proId}
        GROUP BY userId
        HAVING ${having}
    ) _b
    JOIN booking b on _b.userId = b.userId
WHERE b.createdAt >= ${week}
    ` as PrismaPromise<{ cnt: number }[]>
}

const getDailyBookingRatio = async ({
  db,
  proId,
}: {
  db: PrismaClient
  proId: number
}) => {
  const query = (having: Prisma.Sql) =>
    db.$queryRaw`
SELECT CAST(COUNT(DISTINCT b.userId) AS CHAR(32)) AS cnt
FROM (
        SELECT
            userId,
            COUNT(userId) cnt
        FROM Booking b
        WHERE
            b.status = 'completed'
            and proId = ${proId}
        GROUP BY userId
        HAVING ${having}
    ) _b
    JOIN booking b on _b.userId = b.userId
WHERE b.createdAt >= ${dayjs().startOf('d').toDate()}
    ` as PrismaPromise<{ cnt: number }[]>

  const [returnedCount, newCount] = await db.$transaction([
    query(Prisma.sql`cnt > 1`),
    query(Prisma.sql`cnt = 1`),
  ])

  return {
    day: {
      returnedCount: returnedCount?.[0].cnt || 0,
      newCount: newCount?.[0].cnt || 0,
    },
  }
}

const getWeeklyDayBookingRatio = async ({
  db,
  proId,
}: {
  db: PrismaClient
  proId: number
}) => {
  const week = dayjs().startOf('w')

  const query = (having: Prisma.Sql, start: Dayjs, end: Dayjs) =>
    db.$queryRaw`
SELECT CAST(COUNT(DISTINCT b.userId) AS CHAR(32)) cnt
FROM (
        SELECT
            userId,
            COUNT(userId) cnt
        FROM Booking b
        WHERE
            b.status = 'completed'
            and proId = ${proId}
        GROUP BY userId
        HAVING ${having}
    ) _b
    JOIN booking b on _b.userId = b.userId
WHERE b.createdAt BETWEEN ${start.toDate()} AND ${end.toDate()}
    ` as PrismaPromise<{ cnt: number }[]>

  const [
    retCntMon,
    newCntMon,
    retCntTue,
    newCntTue,
    retCntWed,
    newCntWed,
    retCntThur,
    newCntThur,
    retCntFri,
    newCntFri,
    retCntSat,
    newCntSat,
    retCntSun,
    newCntSun,
    retCntTotal,
    newCntTotal,
  ] = await db.$transaction([
    query(Prisma.sql`cnt > 1`, week, week.add(1, 'd').subtract(1, 'ms')), //Monday
    query(Prisma.sql`cnt = 1`, week, week.add(1, 'd').subtract(1, 'ms')), //Monday
    query(
      Prisma.sql`cnt > 1`,
      week.add(1, 'd'),
      week.add(2, 'd').subtract(1, 'ms'),
    ),
    query(
      Prisma.sql`cnt = 1`,
      week.add(1, 'd'),
      week.add(2, 'd').subtract(1, 'ms'),
    ),
    query(
      Prisma.sql`cnt > 1`,
      week.add(2, 'd'),
      week.add(3, 'd').subtract(1, 'ms'),
    ),
    query(
      Prisma.sql`cnt = 1`,
      week.add(2, 'd'),
      week.add(3, 'd').subtract(1, 'ms'),
    ),
    query(
      Prisma.sql`cnt > 1`,
      week.add(3, 'd'),
      week.add(4, 'd').subtract(1, 'ms'),
    ),
    query(
      Prisma.sql`cnt = 1`,
      week.add(3, 'd'),
      week.add(4, 'd').subtract(1, 'ms'),
    ),
    query(
      Prisma.sql`cnt > 1`,
      week.add(4, 'd'),
      week.add(5, 'd').subtract(1, 'ms'),
    ),
    query(
      Prisma.sql`cnt = 1`,
      week.add(4, 'd'),
      week.add(5, 'd').subtract(1, 'ms'),
    ),
    query(
      Prisma.sql`cnt > 1`,
      week.add(5, 'd'),
      week.add(6, 'd').subtract(1, 'ms'),
    ),
    query(
      Prisma.sql`cnt = 1`,
      week.add(5, 'd'),
      week.add(6, 'd').subtract(1, 'ms'),
    ),
    query(
      Prisma.sql`cnt > 1`,
      week.add(7, 'd'),
      week.add(8, 'd').subtract(1, 'ms'),
    ), //Sunday
    query(
      Prisma.sql`cnt = 1`,
      week.add(7, 'd'),
      week.add(8, 'd').subtract(1, 'ms'),
    ), //Sunday
    getWeekTotalBookingRatio({ db, proId, having: Prisma.sql`cnt > 1` }),
    getWeekTotalBookingRatio({ db, proId, having: Prisma.sql`cnt = 1` }),
  ])

  return {
    mon: {
      new: newCntMon?.[0].cnt || 0,
      returned: retCntMon?.[0].cnt || 0,
    },
    tue: {
      new: newCntTue?.[0].cnt || 0,
      returned: retCntTue?.[0].cnt || 0,
    },
    wed: {
      new: newCntWed?.[0].cnt || 0,
      returned: retCntWed?.[0].cnt || 0,
    },
    thur: {
      new: newCntThur?.[0].cnt || 0,
      returned: retCntThur?.[0].cnt || 0,
    },
    fri: {
      new: newCntFri?.[0].cnt || 0,
      returned: retCntFri?.[0].cnt || 0,
    },
    sat: {
      new: newCntSat?.[0].cnt || 0,
      returned: retCntSat?.[0].cnt || 0,
    },
    sun: {
      new: newCntSun?.[0].cnt || 0,
      returned: retCntSun?.[0].cnt || 0,
    },
    total: {
      new: newCntTotal?.[0].cnt || 0,
      returned: retCntTotal?.[0].cnt || 0,
    },
  }
}

const getUsers = (db: PrismaClient, proId: number, having: Prisma.Sql) =>
  db.$queryRaw`
SELECT
      userId,
      COUNT(userId) cnt
  FROM Booking b
  WHERE
      b.status = 'completed'
      and proId = ${proId}
  GROUP BY userId
  HAVING ${having}
` as PrismaPromise<{ userId: string; cnt: string }[]>

export const getProBookingRatio =
  ({ db }: { db: PrismaClient }) =>
  async ({ proId, period }: GetProBookingRatioReq) => {
    try {
      // const [newUsers, retUsers] = await db.$transaction([
      //   getUsers(db, proId, Prisma.sql`cnt=1`),
      //   getUsers(db, proId, Prisma.sql`cnt>1`),
      // ])

      if (period === 'day') return await getDailyBookingRatio({ db, proId })
      return await getWeeklyDayBookingRatio({ db, proId })
    } catch (error) {
      console.log(error)
    }
  }
