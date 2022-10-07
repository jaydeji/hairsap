import { PrismaClient, User } from '@prisma/client'
import { Cursor } from '../schemas/models/Cursor'

const getChatList =
  ({ db }: { db: PrismaClient }) =>
  async (userId: number) => {
    const users = await db.$queryRaw<
      {
        name: User['name']
        userId: User['userId']
        profilePhotoUrl: User['profilePhotoUrl']
      }[]
    >`
  SELECT userId,name,profilePhotoUrl FROM (SELECT DISTINCT 
    CASE 
    WHEN senderId = ${userId} THEN receiverId 
    WHEN receiverId = ${userId} THEN senderId
    END as id
  FROM Chat) temp
  INNER JOIN User ON userId = id 
  WHERE id is not NULL`

    const lastChatMessages = await db.$transaction(
      users.map((e) => {
        return db.chat.findFirst({
          where: {
            OR: [
              { receiverId: userId, senderId: e.userId },
              { receiverId: e.userId, senderId: userId },
            ],
          },
          orderBy: {
            createdAt: 'desc',
          },
        })
      }),
    )

    return users.map((user) => ({
      ...user,
      chat: lastChatMessages.find(
        (chat) =>
          chat?.receiverId === user.userId || chat?.senderId === user.userId,
      ),
    }))
  }

const getChatById =
  ({ db }: { db: PrismaClient }) =>
  ({
    userId,
    otherUserId,
    cursor,
    take = 20,
    desc = false,
  }: {
    userId: number
    otherUserId: number
  } & Cursor) =>
    db.chat.findMany({
      take: desc ? take : -take,
      skip: 1,
      cursor: cursor
        ? {
            chatId: cursor,
          }
        : undefined,
      where: {
        OR: [
          {
            senderId: userId,
            receiverId: otherUserId,
          },
          {
            senderId: otherUserId,
            receiverId: userId,
          },
        ],
      },
      orderBy: {
        createdAt: desc ? 'desc' : 'asc',
      },
    })

const makeChatRepo = ({ db }: { db: PrismaClient }) => {
  return {
    getChatList: getChatList({ db }),
    getChatById: getChatById({ db }),
  }
}

export default makeChatRepo
