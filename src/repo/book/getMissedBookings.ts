import { PrismaClient } from '@prisma/client'

export const getMissedBookings =
  ({ db }: { db: PrismaClient }) =>
  async ({ proId }: { proId: number }) => {
    const sqlBookings = (await db.$queryRaw`
    WITH returnedData AS (SELECT DISTINCT userId, proId FROM Booking b WHERE b.status='completed' AND b.proId=${proId})
SELECT b.bookingId,
(CASE WHEN COALESCE((SELECT 1 FROM returnedData r WHERE b.userId=r.userId AND b.proId=r.proId),0) THEN 'true' ELSE 'false' END) returned 
FROM Booking b WHERE b.proId=${proId} AND (b.status='pending' OR b.status='cancelled')`) as {
      bookingId: number
      returned: 'true' | 'false'
    }[]

    const remappedBooking = new Map(
      sqlBookings.map((i) => [i.bookingId, i.returned === 'true']),
    )

    const bookings = (
      await db.booking.findMany({
        where: {
          bookingId: { in: sqlBookings.map((e) => e.bookingId) },
        },
        select: {
          bookingId: true,
          arrived: true,
          inTransit: true,
          address: true,
          samplePhotoUrl: true,
          status: true,
          acceptedAt: true,
          rejectedAt: true,
          arrivalAt: true,
          cancelledAt: true,
          pinDate: true,
          pinStatus: true,
          pinAmount: true,
          pro: {
            select: {
              address: true,
              available: true,
              businessName: true,
              createdAt: true,
              userId: true,
              longitude: true,
              latitude: true,
              profilePhotoUrl: true,
              email: true,
              name: true,
              phone: true,
            },
          },
          proId: true,
          user: {
            select: {
              address: true,
              available: true,
              createdAt: true,
              userId: true,
              longitude: true,
              latitude: true,
              profilePhotoUrl: true,
              faceIdPhotoUrl: true,
              email: true,
              name: true,
              phone: true,
            },
          },
          userId: true,
          invoice: {
            select: {
              transportFee: true,
              distance: true,
              invoiceFees: {
                select: {
                  name: true,
                  price: true,
                  createdAt: true,
                  feeId: true,
                },
              },
            },
          },
          bookedSubServices: {
            select: {
              subService: {
                select: {
                  name: true,
                  photoUrl: true,
                  subServiceId: true,
                },
              },
            },
          },
          createdAt: true,
          updatedAt: true,
        },
        orderBy: [
          {
            pinStatus: 'desc',
          },
          {
            updatedAt: 'desc',
          },
        ],
      })
    ).map((e) => ({ ...e, returned: remappedBooking.get(e.bookingId) }))

    const total = bookings.reduce((acc, e) => acc + Number(e.bookingId), 0)

    return { count: bookings.length, bookings, total }
  }
