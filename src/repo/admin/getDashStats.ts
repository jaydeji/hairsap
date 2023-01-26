import { PrismaClient } from '@prisma/client'
import { ROLES } from '../../config/constants'

export const getDashboardStats =
  ({ db }: { db: PrismaClient }) =>
  async () => {
    const [pU, proU, totU, braiding, styling, barbing, locs, totalBookings] =
      await db.$transaction([
        db.user.aggregate({
          _count: true,
          where: {
            role: ROLES.USER,
          },
        }),
        db.user.aggregate({
          _count: true,
          where: {
            OR: [
              {
                role: ROLES.USER,
              },
              {
                role: ROLES.PRO,
              },
            ],
          },
        }),
        db.user.aggregate({
          _count: true,
        }),
        db.booking.aggregate({
          _count: true,
          where: {
            bookedSubServices: {
              some: {
                subService: {
                  serviceId: 1,
                },
              },
            },
          },
        }),
        db.booking.aggregate({
          _count: true,
          where: {
            bookedSubServices: {
              some: {
                subService: {
                  serviceId: 2,
                },
              },
            },
          },
        }),
        db.booking.aggregate({
          _count: true,
          where: {
            bookedSubServices: {
              some: {
                subService: {
                  serviceId: 3,
                },
              },
            },
          },
        }),
        db.booking.aggregate({
          _count: true,
          where: {
            bookedSubServices: {
              some: {
                subService: {
                  serviceId: 4,
                },
              },
            },
          },
        }),
        db.booking.aggregate({
          _count: true,
        }),
      ])
    return {
      personalUsers: pU._count,
      proUsers: proU._count,
      totalUsers: totU._count,
      bookings: {
        braiding: braiding._count,
        styling: styling._count,
        barbing: barbing._count,
        locs: locs._count,
        total: totalBookings._count,
      },
    }
  }
