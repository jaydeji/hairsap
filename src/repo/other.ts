import { Prisma, PrismaClient } from '@prisma/client'
import { Role } from '../types'
import { dayjs } from '../utils'

const dbHealthCheck =
  ({ db }: { db: PrismaClient }) =>
  () =>
    db.$queryRaw`SELECT 1`

const getServices =
  ({ db }: { db: PrismaClient }) =>
  () =>
    db.service.findMany({
      include: {
        subServices: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    })

const getSubServiceById =
  ({ db }: { db: PrismaClient }) =>
  (subServiceId: number) =>
    db.subService.findUnique({
      where: {
        subServiceId,
      },
    })

const getNotifications =
  ({ db }: { db: PrismaClient }) =>
  (userId: number) =>
    db.notification.findMany({
      take: 20,
      orderBy: {
        createdAt: 'asc',
      },
      where: {
        userId,
      },
    })

const getNotificationStatus =
  ({ db }: { db: PrismaClient }) =>
  ({
    userId,
    period,
    type,
  }: {
    userId: number
    type: string
    period: 'week' | 'day'
  }) =>
    db.notificationTracker.findFirst({
      where: {
        userId,
        createdAt: { gte: dayjs().startOf(period).toDate() },
        type,
      },
    })

const addNotificationStatus =
  ({ db }: { db: PrismaClient }) =>
  ({ userId, type }: { userId: number; type: string }) =>
    db.notificationTracker.create({
      data: {
        userId,
        type,
      },
    })

const createNotification =
  ({ db }: { db: PrismaClient }) =>
  ({
    userId,
    body,
    title,
  }: {
    userId: number
    body?: string
    title?: string
  }) =>
    db.notification.create({
      data: {
        body,
        title,
        userId,
      },
    })

const setPushToken =
  ({ db }: { db: PrismaClient }) =>
  ({ userId, pushToken }: { userId: number; pushToken: string }) =>
    db.user.update({
      where: {
        userId,
      },
      data: {
        pushToken,
      },
    })

const getPushToken =
  ({ db }: { db: PrismaClient }) =>
  ({ userId }: { userId: number }) =>
    db.user.findUnique({
      where: {
        userId,
      },
      select: {
        pushToken: true,
      },
    })

const deactivateUserOrPro =
  ({ db }: { db: PrismaClient }) =>
  async (body: { userId: number }) => {
    const proOpt = { where: { proId: body.userId } }
    const userOpt = { where: { userId: body.userId } }
    const user = await db.user.findFirst({
      where: userOpt.where,
      include: {
        account: true,
        card: true,
        deactivations: true,
        paymentEvents: true,
        proBookings: true,
        bonuses: true,
      },
    })
    if (!user) return
    return db.user.delete(userOpt)
  }

const makeOtherRepo = ({ db }: { db: PrismaClient }) => {
  return {
    getServices: getServices({ db }),
    getSubServiceById: getSubServiceById({ db }),
    getNotifications: getNotifications({ db }),
    getNotificationStatus: getNotificationStatus({ db }),
    addNotificationStatus: addNotificationStatus({ db }),
    createNotification: createNotification({ db }),
    setPushToken: setPushToken({ db }),
    getPushToken: getPushToken({ db }),
    dbHealthCheck: dbHealthCheck({ db }),
    deactivateUserOrPro: deactivateUserOrPro({ db }),
  }
}

export default makeOtherRepo
