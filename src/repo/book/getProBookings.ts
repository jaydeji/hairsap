import { Prisma, PrismaClient } from '@prisma/client'
import { GetProBookingsReq } from '../../schemas/request/getProBookings'
import { dayjs } from '../../utils'

const query = ({
  db,
  proId,
  period,
  status,
}: {
  db: PrismaClient
  proId: number
  period: GetProBookingsReq['period']
  status: GetProBookingsReq['status']
}) => {
  const _period = dayjs().startOf(period).toDate()
  const having =
    status === 'new'
      ? Prisma.sql` HAVING COUNT(userId) = 1`
      : status === 'returned'
      ? Prisma.sql` HAVING COUNT(userId) > 1`
      : Prisma.empty

  if (status === 'completed') {
    return db.$queryRaw`
SELECT
    ifees.name,
    SUM(ifees.price) total
FROM Booking b 
    JOIN Invoice i ON b.bookingId = i.bookingId
    JOIN InvoiceFees ifees ON i.invoiceId = ifees.invoiceId
WHERE b.createdAt >= ${_period}
    AND b.proId = ${proId}
    AND b.status = 'completed'
GROUP BY ifees.name;
    `
  }

  return db.$queryRaw`
    SELECT
    ifees.name,
    SUM(ifees.price) total
FROM (
        SELECT userId
        FROM Booking
        WHERE
            proId = ${proId}
            AND status = 'completed'
        GROUP BY userId
        ${having}
    ) _b
    JOIN Booking b on _b.userId = b.userId
    JOIN Invoice i ON b.bookingId = i.bookingId
    JOIN InvoiceFees ifees ON i.invoiceId = ifees.invoiceId
WHERE b.createdAt >= ${_period}
GROUP BY ifees.name;
    `
}

export const getProBookings =
  ({ db }: { db: PrismaClient }) =>
  async ({
    period,
    proId,
    status,
  }: {
    proId: number
    status: GetProBookingsReq['status']
    period: GetProBookingsReq['period']
  }) => {
    const bookings = (await query({ db, period, proId, status })) as {
      name: string
      total: string
    }[]
    const total = bookings.reduce((acc, e) => acc + Number(e.total), 0)

    return { count: bookings.length, bookings, total }
  }
