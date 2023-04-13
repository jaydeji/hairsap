import { PrismaClient } from '@prisma/client'
import { getDashboardStats } from './getDashStats'
import { getDashboardBookingStats } from './getDashBookingStats'
import { getDashboardDiscountedBookingStats } from './getDashboardDiscountedBookingStats'
import { getDashboardCompletedBookingStats } from './getDashboardCompletedBookingStats'
import { BOOKING_STATUS, PIN_STATUS } from '../../config/constants'

const getUnacceptedProPhotos =
  ({ db }: { db: PrismaClient }) =>
  () => {
    return db.user.findMany({
      where: {
        tempProfilePhotoUrl: { not: null },
      },
      select: {
        userId: true,
        name: true,
        profilePhotoUrl: true,
        tempProfilePhotoUrl: true,
      },
    })
  }

const getUnacceptedProPhoto =
  ({ db }: { db: PrismaClient }) =>
  (proId: number) => {
    return db.user.findUnique({
      where: {
        userId: proId,
      },
      select: {
        tempProfilePhotoUrl: true,
        tempProfilePhotoKey: true,
        tempProfilePhotoOriginalFileName: true,
      },
    })
  }

export const getDashboardPinnedBookingStats =
  ({ db }: { db: PrismaClient }) =>
  async () => {
    const [count, amount] = await db.$transaction([
      db.booking.count({
        where: {
          pinStatus: PIN_STATUS.PAID,
          status: BOOKING_STATUS.COMPLETED,
        },
      }),
      db.invoiceFees.aggregate({
        where: {
          invoice: {
            booking: {
              pinStatus: PIN_STATUS.PAID,
              status: BOOKING_STATUS.COMPLETED,
            },
          },
        },
        _sum: {
          price: true,
        },
      }),
    ])

    return {
      count,
      amount: amount._sum.price,
    }
  }

const makAdminRepo = ({ db }: { db: PrismaClient }) => {
  return {
    getDashboardStats: getDashboardStats({ db }),
    getDashboardBookingStats: getDashboardBookingStats({ db }),
    getDashboardDiscountedBookingStats: getDashboardDiscountedBookingStats({
      db,
    }),
    getDashboardCompletedBookingStats: getDashboardCompletedBookingStats({
      db,
    }),
    getUnacceptedProPhotos: getUnacceptedProPhotos({ db }),
    getUnacceptedProPhoto: getUnacceptedProPhoto({ db }),
    getDashboardPinnedBookingStats: getDashboardPinnedBookingStats({ db }),
  }
}

export default makAdminRepo
