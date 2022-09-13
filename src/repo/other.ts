import { PrismaClient } from '@prisma/client'
import { dayjs } from '../utils'

const getServices =
  ({ db }: { db: PrismaClient }) =>
  () =>
    db.service.findMany({
      include: {
        subServices: true,
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

const makeOtherRepo = ({ db }: { db: PrismaClient }) => {
  return {
    getServices: getServices({ db }),
    getNotifications: getNotifications({ db }),
    getNotificationStatus: getNotificationStatus({ db }),
    addNotificationStatus: addNotificationStatus({ db }),
    createNotification: createNotification({ db }),
    setPushToken: setPushToken({ db }),
    getPushToken: getPushToken({ db }),
  }
}

export default makeOtherRepo
