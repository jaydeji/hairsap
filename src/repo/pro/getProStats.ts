import { PrismaClient } from '@prisma/client'
import { BOOKING_STATUS, PERIODIC_CASH_AMOUNTS } from '../../config/constants'
import { dayjs } from '../../utils'

const getTargetByPeriod = (
  db: PrismaClient,
  proId: number,
  period: 'month' | 'day' | 'week',
) => {
  return db.invoiceFees.aggregate({
    where: {
      invoice: {
        booking: {
          proId,
          createdAt: {
            gte: dayjs().startOf(period).toDate(),
          },
          status: BOOKING_STATUS.COMPLETED,
        },
      },
    },
    _sum: {
      price: true,
    },
  })
}

export const getProStats =
  ({ db }: { db: PrismaClient }) =>
  async ({ proId }: { proId: number }) => {
    const week = dayjs().startOf('week').toDate()

    const [
      _ratings,
      deactivations,
      transport,
      earnings,
      dailyTarget,
      weeklyTarget,
      monthlyTarget,
    ] = await db.$transaction([
      db.booking.count({
        where: {
          proId,
          createdAt: {
            gte: week,
          },
          rating: 5,
        },
      }),
      db.deactivation.aggregate({
        where: {
          proId,
          createdAt: {
            gte: week,
          },
        },
        _sum: {
          amount: true,
        },
      }),
      db.invoice.aggregate({
        where: {
          booking: {
            proId,
            status: BOOKING_STATUS.COMPLETED,
            createdAt: {
              gte: week,
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
              createdAt: {
                gte: week,
              },
              status: BOOKING_STATUS.COMPLETED,
            },
          },
        },
        _sum: {
          price: true,
        },
      }),
      getTargetByPeriod(db, proId, 'day'),
      getTargetByPeriod(db, proId, 'week'),
      getTargetByPeriod(db, proId, 'month'),
    ])

    return {
      ratings: _ratings > 5 ? 5 : _ratings,
      earnings:
        (earnings._sum.price || 0) * PERIODIC_CASH_AMOUNTS.PRO_EARNING_PERCENT +
        (transport._sum.transportFee || 0) -
        (deactivations._sum.amount || 0),
      dailyTarget:
        ((dailyTarget._sum.price || 0) /
          PERIODIC_CASH_AMOUNTS.DAILY_TASK_TARGET) *
        100,
      weeklyTarget:
        ((weeklyTarget._sum.price || 0) /
          PERIODIC_CASH_AMOUNTS.WEEKLY_TASK_TARGET) *
        100,
      monthlyTarget:
        ((monthlyTarget._sum.price || 0) /
          PERIODIC_CASH_AMOUNTS.MONTHLY_TASK_TARGET) *
        100,
      dailyEarning: dailyTarget._sum.price,
      weeklyEarning: weeklyTarget._sum.price,
    }
  }
