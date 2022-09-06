import type { PrismaClient } from '@prisma/client'
import {
  BOOKING_STATUS,
  CHANNEL,
  DEACTIVATION_REASONS,
  PERIODIC_CASH_AMOUNTS,
  ROLES,
} from '../../config/constants'
import { Repo } from '../../types'
import { dayjs } from '../../utils'

export const deactivateProByTaskTargetEveryWeek = async ({
  db,
}: {
  db: PrismaClient
}) => {
  const week = dayjs().startOf('week').toDate()

  const _prosToDeactivate = await db.user.findMany({
    where: {
      role: ROLES.PRO,
      deactivated: { not: true },
      terminated: { not: true },
      verified: true,
      proBookings: {
        some: {
          status: BOOKING_STATUS.COMPLETED,
          createdAt: {
            gte: week,
          },
        },
      },
    },
    include: {
      proBookings: {
        include: {
          invoice: {
            include: {
              invoiceFees: true,
            },
          },
        },
      },
    },
  })

  const prosToDeactivate = _prosToDeactivate
    .filter((e) => {
      const sumOfBookings = e.proBookings.reduce((acc, pb) => {
        return (
          acc +
          (pb.invoice?.invoiceFees.reduce((acc, ifees) => {
            return ifees.price + acc
          }, 0) || 0)
        )
      }, 0)
      if (e.proBookings.length < 24) return false
      if (sumOfBookings >= PERIODIC_CASH_AMOUNTS.WEEKLY_TASK_TARGET)
        return false
      return true
    })
    .map((pro) => pro.userId)

  await db.$transaction(
    prosToDeactivate.map((proId) =>
      db.user.update({
        data: {
          deactivated: true,
          deactivationCount: {
            increment: 1,
          },
          deactivations: {
            create: {
              reason: DEACTIVATION_REASONS.WEEKLY.reason,
              amount: DEACTIVATION_REASONS.WEEKLY.amount,
            },
          },
        },
        where: {
          userId: proId,
        },
      }),
    ),
  )
}

export const deactivateProByStarRating = async ({
  db,
}: {
  db: PrismaClient
}) => {
  const week = dayjs().startOf('week').toDate()

  const pros = await db.user.findMany({
    where: {
      role: ROLES.PRO,
      proBookings: {
        some: {
          createdAt: {
            gte: week,
          },
          status: BOOKING_STATUS.COMPLETED,
        },
      },
    },
    include: {
      proBookings: true,
    },
  })

  const prosToDeactivate = pros
    .filter((pro) => pro.proBookings.filter((pb) => pb.rating === 5).length < 5)
    .map((pro) => pro.userId)

  await db.$transaction(
    prosToDeactivate.map((proId) =>
      db.user.update({
        data: {
          deactivated: true,
          deactivationCount: {
            increment: 1,
          },
          deactivations: {
            create: {
              reason: DEACTIVATION_REASONS.RATING.reason,
              amount: DEACTIVATION_REASONS.RATING.amount,
            },
          },
        },
        where: {
          userId: proId,
        },
      }),
    ),
  )
}

export const deactivateProByWeeklyReturningRatio = async ({
  db,
}: {
  db: PrismaClient
}) => {
  const week = dayjs().startOf('week').toDate()

  //   const newBookingUsers = await db.booking.findMany({
  //     where: {
  //       user: {
  //         userBookings: {
  //           some: {
  //             createdAt: {
  //               gte: week,
  //             },
  //           },
  //         },
  //       },
  //     },
  //   })
  const newBookingUsers = await db.user.findMany({
    where: {
      role: ROLES.PRO,
      userBookings: {
        some: {
          createdAt: {
            gte: week,
          },
        },
      },
    },
    include: {
      userBookings: true,
    },
  })

  //   const prosToDeactivate = pros
  //     .filter((pro) => pro.proBookings.filter((pb) => pb.rating === 5).length < 5)
  //     .map((pro) => pro.userId)

  //   await db.$transaction(
  //     prosToDeactivate.map((proId) =>
  //       db.user.update({
  //         data: {
  //           deactivated: true,
  //           deactivationCount: {
  //             increment: 1,
  //           },
  //           Deactivation: {
  //             create: {
  //               reason: DEACTIVATION_REASONS.RATING.reason,
  //               amount: DEACTIVATION_REASONS.RATING.amount,
  //             },
  //           },
  //         },
  //         where: {
  //           userId: proId,
  //         },
  //       }),
  //     ),
  //   )
}

export const deactivateProNonRedeems = async ({
  db,
  proId,
  repo,
}: {
  db: PrismaClient
  repo: Repo
  proId: number
}) => {
  const week = dayjs().startOf('week').toDate()

  const sentRedeemCashNotification = await repo.other.getNotificationStatus({
    userId: proId,
    period: 'day',
    type: 'redeem',
  })

  if (!sentRedeemCashNotification) return

  const unredeemedCashPayments = await db.invoice.findMany({
    where: {
      channel: CHANNEL.CASH,
      paid: {
        not: true,
      },
      booking: {
        proId,
        createdAt: {
          lt: sentRedeemCashNotification.createdAt,
        },
      },
    },
    include: {
      invoiceFees: true,
    },
  })

  const total = unredeemedCashPayments.reduce(
    (acc, e) =>
      acc +
      e.invoiceFees.reduce((acc2, e2) => acc2 + e2.price, 0) +
      e.transportFee,
    0,
  )
  if (total >= 0) {
    await db.user.update({
      data: {
        deactivated: true,
        deactivationCount: {
          increment: 1,
        },
        deactivations: {
          create: {
            reason: DEACTIVATION_REASONS.HOURS.reason,
            amount: DEACTIVATION_REASONS.HOURS.amount,
          },
        },
      },
      where: {
        userId: proId,
      },
    })
  }

  const pros = await db.user.findMany({
    where: {
      role: ROLES.PRO,
      proBookings: {
        some: {
          createdAt: {
            gte: week,
          },
          status: BOOKING_STATUS.COMPLETED,
        },
      },
    },
    include: {
      proBookings: true,
    },
  })

  const prosToDeactivate = pros
    .filter((pro) => pro.proBookings.filter((pb) => pb.rating === 5).length < 5)
    .map((pro) => pro.userId)

  await db.$transaction(
    prosToDeactivate.map((proId) =>
      db.user.update({
        data: {
          deactivated: true,
          deactivationCount: {
            increment: 1,
          },
          deactivations: {
            create: {
              reason: DEACTIVATION_REASONS.RATING.reason,
              amount: DEACTIVATION_REASONS.RATING.amount,
            },
          },
        },
        where: {
          userId: proId,
        },
      }),
    ),
  )
}

export const terminateDeactivatedUsers = async ({
  db,
}: {
  db: PrismaClient
}) => {
  await db.user.updateMany({
    data: {
      terminated: true,
    },
    where: {
      role: ROLES.PRO,
      deactivationCount: {
        gte: 4,
      },
    },
  })
}