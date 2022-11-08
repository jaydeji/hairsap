import { PrismaClient } from '@prisma/client'
import { getDashboardStats } from './getDashStats'
import { getDashboardBookingStats } from './getDashBookingStats'
import { getDashboardDiscountedBookingStats } from './getDashboardDiscountedBookingStats'
import { getDashboardCompletedBookingStats } from './getDashboardCompletedBookingStats'

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
  }
}

export default makAdminRepo
