import { PrismaClient, PrismaPromise } from '@prisma/client'
import { dayjs } from '../../utils'

const getCount = (db: PrismaClient) => {
  const _period = dayjs().startOf('month').toDate()

  return db.$queryRaw`
  SELECT
  SUM(ifees.price) amount
FROM Booking b
    JOIN Invoice i on b.bookingId = i.bookingId
    JOIN BookingSubService bss ON b.bookingId = bss.bookingId
    JOIN SubService ss ON bss.subServiceId = ss.subServiceId
    JOIN Service s ON ss.serviceId = s.serviceId
    JOIN InvoiceFees ifees ON i.invoiceId = ifees.invoiceId
WHERE b.status = 'completed'
AND b.createdAt >= ${_period}
GROUP BY s.serviceId;
  `
}

const getAmount = (db: PrismaClient) => {
  const _period = dayjs().startOf('month').toDate()

  return db.$queryRaw`
  SELECT
    SUM(ifees.price) amount
FROM Booking b
    JOIN Invoice i on b.bookingId = i.bookingId
    JOIN BookingSubService bss ON b.bookingId = bss.bookingId
    JOIN SubService ss ON bss.subServiceId = ss.subServiceId
    JOIN Service s ON ss.serviceId = s.serviceId
    JOIN InvoiceFees ifees ON i.invoiceId = ifees.invoiceId
WHERE b.status = 'completed'
AND b.createdAt >= ${_period}
GROUP BY s.serviceId;
  `
}

export const getDashboardCompletedBookingStats =
  ({ db }: { db: PrismaClient }) =>
  async () => {
    const [bookings, amount] = await db.$transaction([
      getCount(db) as PrismaPromise<
        {
          serviceIdCnt: string
          serviceId: string
          name: string
        }[]
      >,
      getAmount(db) as PrismaPromise<
        {
          amount: number
        }[]
      >,
    ])

    return {
      bookings,
      amount: amount[0]?.amount || 0,
    }
  }
