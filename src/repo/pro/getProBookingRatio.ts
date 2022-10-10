import { Prisma, PrismaClient, PrismaPromise } from '@prisma/client'
import { Dayjs } from 'dayjs'
import { GetProBookingRatioReq } from '../../schemas/request/getProBookingRatio'
import { dayjs } from '../../utils'

const getDailyBookingRatio = async ({
  db,
  newUsers,
  retUsers,
}: {
  db: PrismaClient
  newUsers: string[]
  retUsers: string[]
}) => {
  const query = (users: string[]) =>
    db.$queryRaw`
SELECT CAST(COUNT(DISTINCT b.userId) AS CHAR(32)) AS cnt
FROM Booking b 
WHERE b.createdAt >= ${dayjs().startOf('d').toDate()}
AND b.userId in (${users.length ? Prisma.join(users) : ''})
    ` as PrismaPromise<{ cnt: number }[]>

  const [returnedCount, newCount] = await db.$transaction([
    query(newUsers),
    query(retUsers),
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
  newUsers,
  retUsers,
}: {
  db: PrismaClient
  newUsers: string[]
  retUsers: string[]
}) => {
  const week = dayjs().startOf('w')

  const query = (users: string[], start: Dayjs, end: Dayjs) =>
    db.$queryRaw`
SELECT CAST(COUNT(DISTINCT b.userId) AS CHAR(32)) cnt
FROM Booking b 
WHERE b.createdAt BETWEEN ${start.toDate()} AND ${end.toDate()}
AND b.userId in (${users.length ? Prisma.join(users) : ''})
    ` as PrismaPromise<{ cnt: number }[]>

  const result = await db.$transaction([
    query(retUsers, week, week.add(1, 'd').subtract(1, 'ms')), //Monday
    query(newUsers, week, week.add(1, 'd').subtract(1, 'ms')), //Monday
    query(retUsers, week.add(1, 'd'), week.add(2, 'd').subtract(1, 'ms')),
    query(newUsers, week.add(1, 'd'), week.add(2, 'd').subtract(1, 'ms')),
    query(retUsers, week.add(2, 'd'), week.add(3, 'd').subtract(1, 'ms')),
    query(newUsers, week.add(2, 'd'), week.add(3, 'd').subtract(1, 'ms')),
    query(retUsers, week.add(3, 'd'), week.add(4, 'd').subtract(1, 'ms')),
    query(newUsers, week.add(3, 'd'), week.add(4, 'd').subtract(1, 'ms')),
    query(retUsers, week.add(4, 'd'), week.add(5, 'd').subtract(1, 'ms')),
    query(newUsers, week.add(4, 'd'), week.add(5, 'd').subtract(1, 'ms')),
    query(retUsers, week.add(5, 'd'), week.add(6, 'd').subtract(1, 'ms')),
    query(newUsers, week.add(5, 'd'), week.add(6, 'd').subtract(1, 'ms')),
    query(retUsers, week.add(7, 'd'), week.add(8, 'd').subtract(1, 'ms')), //Sunday
    query(newUsers, week.add(7, 'd'), week.add(8, 'd').subtract(1, 'ms')), //Sunday
  ])

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
  ] = result

  return {
    mon: {
      new: +(newCntMon?.[0].cnt || 0),
      returned: +(retCntMon?.[0].cnt || 0),
    },
    tue: {
      new: +(newCntTue?.[0].cnt || 0),
      returned: +(retCntTue?.[0].cnt || 0),
    },
    wed: {
      new: +(newCntWed?.[0].cnt || 0),
      returned: +(retCntWed?.[0].cnt || 0),
    },
    thur: {
      new: +(newCntThur?.[0].cnt || 0),
      returned: +(retCntThur?.[0].cnt || 0),
    },
    fri: {
      new: +(newCntFri?.[0].cnt || 0),
      returned: +(retCntFri?.[0].cnt || 0),
    },
    sat: {
      new: +(newCntSat?.[0].cnt || 0),
      returned: +(retCntSat?.[0].cnt || 0),
    },
    sun: {
      new: +(newCntSun?.[0].cnt || 0),
      returned: +(retCntSun?.[0].cnt || 0),
    },
    total: getTotals(result),
  }
}

const getTotals = (
  result: {
    cnt: number
  }[][],
) => {
  const retTot = result.reduce((acc, e, ind) => {
    if (ind % 2 === 0) {
      return acc + +(e?.[0].cnt || 0)
    }
    return acc
  }, 0)

  const newTot = result.reduce((acc, e, ind) => {
    if (ind % 2 !== 0) {
      return acc + +(e?.[0].cnt || 0)
    }
    return acc
  }, 0)

  return {
    new: newTot,
    returned: retTot,
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
    const [_newUsers, _retUsers] = await db.$transaction([
      getUsers(db, proId, Prisma.sql`cnt=1`),
      getUsers(db, proId, Prisma.sql`cnt>1`),
    ])

    const newUsers = _newUsers.map((e) => e.userId)
    const retUsers = _retUsers.map((e) => e.userId)

    if (period === 'day')
      return await getDailyBookingRatio({ db, newUsers, retUsers })

    return await getWeeklyDayBookingRatio({ db, newUsers, retUsers })
  }
