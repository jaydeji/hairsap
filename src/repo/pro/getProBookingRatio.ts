import { Prisma, PrismaClient, PrismaPromise } from '@prisma/client'
import { Dayjs } from 'dayjs'
import { GetProBookingRatioReq } from '../../schemas/request/getProBookingRatio'
import { dayjs } from '../../utils'

const getTotals = (
  result: {
    cnt: number
  }[][],
) => {
  const newTot = result.reduce((acc, e, ind) => {
    if (ind % 2 === 0) {
      return acc + +(e?.[0].cnt || 0)
    }
    return acc
  }, 0)

  const retTot = result.reduce((acc, e, ind) => {
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

const query = (
  db: PrismaClient,
  proId: number,
  having: Prisma.Sql,
  start: Dayjs,
  end: Dayjs,
) => {
  return db.$queryRaw`
  SELECT CAST(COUNT(*) AS CHAR(32)) AS cnt
FROM (
        WITH GroupedData AS(
                SELECT
                    userId,
                    COUNT(userId) cnt
                FROM Booking b
                WHERE
                    b.status = 'completed'
                    AND b.proId = ${proId}
                GROUP BY
                    userId
                HAVING ${having}
            )
        SELECT b.userId
        FROM GroupedData gd
            INNER JOIN Booking b ON gd.userId = b.userId
        WHERE
            b.status = 'completed'
            AND b.proId = ${proId}
            AND b.createdAt BETWEEN ${start.toDate()} AND ${end.toDate()}
        GROUP BY
            b.userId
    ) temp;
  ` as PrismaPromise<{ cnt: number }[]>
}

const newHaving = Prisma.sql`cnt = 1`
const retHaving = Prisma.sql`cnt > 1`

const getDailyBookingRatio = async (db: PrismaClient, proId: number) => {
  const start = dayjs().startOf('d')
  const end = dayjs().endOf('d')
  const [newCount, returnedCount] = await db.$transaction([
    query(db, proId, newHaving, start, end),
    query(db, proId, retHaving, start, end),
  ])

  return {
    day: {
      newCount: +(newCount?.[0].cnt || 0),
      returnedCount: +(returnedCount?.[0].cnt || 0),
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

  const result = await db.$transaction([
    query(db, proId, newHaving, week, week.add(1, 'd').subtract(1, 'ms')), //Monday
    query(db, proId, retHaving, week, week.add(1, 'd').subtract(1, 'ms')), //Monday
    query(
      db,
      proId,
      newHaving,
      week.add(1, 'd'),
      week.add(2, 'd').subtract(1, 'ms'),
    ),
    query(
      db,
      proId,
      retHaving,
      week.add(1, 'd'),
      week.add(2, 'd').subtract(1, 'ms'),
    ),
    query(
      db,
      proId,
      newHaving,
      week.add(2, 'd'),
      week.add(3, 'd').subtract(1, 'ms'),
    ),
    query(
      db,
      proId,
      retHaving,
      week.add(2, 'd'),
      week.add(3, 'd').subtract(1, 'ms'),
    ),
    query(
      db,
      proId,
      newHaving,
      week.add(3, 'd'),
      week.add(4, 'd').subtract(1, 'ms'),
    ),
    query(
      db,
      proId,
      retHaving,
      week.add(3, 'd'),
      week.add(4, 'd').subtract(1, 'ms'),
    ),
    query(
      db,
      proId,
      newHaving,
      week.add(4, 'd'),
      week.add(5, 'd').subtract(1, 'ms'),
    ),
    query(
      db,
      proId,
      retHaving,
      week.add(4, 'd'),
      week.add(5, 'd').subtract(1, 'ms'),
    ),
    query(
      db,
      proId,
      newHaving,
      week.add(5, 'd'),
      week.add(6, 'd').subtract(1, 'ms'),
    ),
    query(
      db,
      proId,
      retHaving,
      week.add(5, 'd'),
      week.add(6, 'd').subtract(1, 'ms'),
    ),
    query(
      db,
      proId,
      newHaving,
      week.add(6, 'd'),
      week.add(7, 'd').subtract(1, 'ms'),
    ), //Sunday
    query(
      db,
      proId,
      retHaving,
      week.add(6, 'd'),
      week.add(7, 'd').subtract(1, 'ms'),
    ), //Sunday
  ])

  const [
    newCntMon,
    retCntMon,
    newCntTue,
    retCntTue,
    newCntWed,
    retCntWed,
    newCntThur,
    retCntThur,
    newCntFri,
    retCntFri,
    newCntSat,
    retCntSat,
    newCntSun,
    retCntSun,
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

export const getProBookingRatio =
  ({ db }: { db: PrismaClient }) =>
  async ({ proId, period }: GetProBookingRatioReq) => {
    if (period === 'day') return await getDailyBookingRatio(db, proId)

    return await getWeeklyDayBookingRatio({ db, proId })
  }
