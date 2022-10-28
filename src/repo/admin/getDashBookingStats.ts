import { Prisma, PrismaClient, PrismaPromise } from '@prisma/client'
import { BOOKING_STATUS } from '../../config/constants'
import { GetAdminDashBookStats } from '../../schemas/request/getAdminDashboardBookingStats'
import { dayjs } from '../../utils'

const query = (
  db: PrismaClient,
  limit: GetAdminDashBookStats['limit'],
  status: GetAdminDashBookStats['status'],
  period: GetAdminDashBookStats['period'],
) => {
  const _period = dayjs().startOf(period).toDate()
  const where =
    limit === 'completed' ? Prisma.sql` AND status = 'completed'` : Prisma.empty
  const having =
    status === 'new'
      ? Prisma.sql` HAVING cnt = 1`
      : status === 'returned'
      ? Prisma.sql` HAVING cnt > 1`
      : Prisma.empty

  if (status === 'all') {
    return db.$queryRaw`
  SELECT
  ss.serviceId,
  s.name,
  COUNT(ss.serviceId) serviceIdCnt 
  FROM Booking b
  JOIN BookingSubService bss ON b.bookingId = bss.bookingId
  JOIN SubService ss ON bss.subServiceId = ss.subServiceId
  JOIN Service s ON ss.serviceId = s.serviceId
  where
  b.createdAt >= ${_period}
  ${where}
  GROUP BY ss.serviceId;
  `
  }

  return db.$queryRaw`
  SELECT
  ss.serviceId,
  s.name,
  COUNT(ss.serviceId) serviceIdCnt
  FROM (
      SELECT
          userId,
          COUNT(userId) cnt
      FROM Booking
      GROUP BY userId
      ${having}
  ) _b
  JOIN Booking b on _b.userId = b.userId
  JOIN BookingSubService bss ON b.bookingId = bss.bookingId
  JOIN SubService ss ON bss.subServiceId = ss.subServiceId
  JOIN Service s ON ss.serviceId = s.serviceId
  where
  b.createdAt >= ${_period}
  ${where}
  GROUP BY ss.serviceId;
  `
}

export const getDashboardBookingStats =
  ({ db }: { db: PrismaClient }) =>
  async ({ limit, period, status }: GetAdminDashBookStats) => {
    const [
      bookings,
      marketersCount,
      marketersCompletedBookingCount,
      marketersCompletedBookingTotal,
    ] = await db.$transaction([
      query(db, limit, status, period) as PrismaPromise<
        {
          serviceIdCnt: string
          serviceId: string
          name: string
        }[]
      >,
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
      bookings,
      total: bookings.reduce((acc, e) => acc + Number(e.serviceIdCnt), 0),
      marketersCount,
      marketersCompletedBookingCount,
      marketersCompletedBookingTotal:
        marketersCompletedBookingTotal._sum.price || 0,
    }
  }
