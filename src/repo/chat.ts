import { PrismaClient, User } from '@prisma/client'
import { Cursor } from '../schemas/models/Cursor'

const getChatList =
  ({ db }: { db: PrismaClient }) =>
  (userId: number) =>
    db.$queryRaw<
      {
        name: User['name']
        userId: User['userId']
        photoUrl: User['photoUrl']
      }[]
    >`
  SELECT userId,name,photoUrl FROM (SELECT DISTINCT 
    CASE 
    WHEN senderId = ${userId} THEN receiverId 
    WHEN receiverId = ${userId} THEN senderId
    END as id
  FROM Chat) temp
  INNER JOIN User ON userId = id 
  WHERE id is not NULL`

const getChatById =
  ({ db }: { db: PrismaClient }) =>
  ({
    userId,
    proId,
    cursor,
    take = 20,
    desc = false,
  }: {
    userId?: number
    proId?: number
  } & Cursor) =>
    db.chat.findMany({
      take: desc ? -take : take,
      skip: 1,
      cursor: cursor
        ? {
            chatId: cursor,
          }
        : undefined,
      where: {
        OR: [
          {
            sentProId: proId,
            sentUserId: userId,
          },
          {
            receivedProId: proId,
            receivedUserId: userId,
          },
        ],
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

const makeChatRepo = ({ db }: { db: PrismaClient }) => {
  return {
    getChatList: getChatList({ db }),
    getChatById: getChatById({ db }),
  }
}

export default makeChatRepo
