import { PrismaClient } from '@prisma/client'
import { Entity } from '../schemas/models/Entity'

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
  ({ userId, adminId, proId }: Entity) =>
    db.notification.findMany({
      take: 20,
      orderBy: {
        createdAt: 'asc',
      },
      where: {
        userId,
        adminId,
        proId,
      },
    })

const makeOtherRepo = ({ db }: { db: PrismaClient }) => {
  return {
    getServices: getServices({ db }),
    getNotifications: getNotifications({ db }),
  }
}

export default makeOtherRepo
