import { PrismaClient } from '@prisma/client'
import { getDashboardStats } from './getDashStats'
import { getDashboardBookingStats } from './getDashBookingStats'

const makAdminRepo = ({ db }: { db: PrismaClient }) => {
  return {
    getDashboardStats: getDashboardStats({ db }),
    getDashboardBookingStats: getDashboardBookingStats({ db }),
  }
}

export default makAdminRepo
