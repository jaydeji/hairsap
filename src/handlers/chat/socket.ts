import { ROLES } from '../../config/constants'
import { IO } from '../../index'
import { ChatMessageType, MessageSchema } from '../../schemas/models/Message'
import { PostBookProReq } from '../../schemas/request/postBookPro'
import { Role, Service } from '../../types'
import { logger } from '../../utils'
import { UnauthorizedError } from '../../utils/Error'
import { verifyJwt } from '../../utils/jwtLib'

//client
// const socket = io.connect('http://localhost:3000', {
//   query: {token,role}
// });

//socket input Object<any>
//socket output Object<{data,message,error}>

const createSocket = ({ io, service }: { io: IO; service: Service }) => {
  const connectedUsers: Record<string, { socketId: string } | undefined> = {}

  io.use(function (socket, next) {
    if (socket.handshake.query.token) {
      try {
        const tokenData = verifyJwt(
          socket.handshake.query.token as string,
          (socket.handshake.query.role as Role) === ROLES.ADMIN,
        )
        ;(socket as any).decodedToken = tokenData
        connectedUsers[tokenData.userId] = {
          socketId: socket.id,
        }
        next()
      } catch (error) {
        next(new UnauthorizedError())
      }
    } else {
      next(new UnauthorizedError())
    }
  })
  io.on('connection', (socket) => {
    logger.debug('a user connected')

    if (process.env.NODE_ENV === 'development') {
      socket.onAny((event, ...args) => {
        logger.info({ event, args })
      })
    }

    socket.on('disconnect', () => {
      connectedUsers[(socket as any).decodedToken.userId] = undefined
      logger.info('user disconnected')
    })

    // socket.on('setup', ({ userId }: { userId: number }) => {
    //   connectedUsers[userId] = {
    //     socketId: socket.id,
    //   }
    // })

    socket.on('new message', async (_message: ChatMessageType, callback) => {
      const parsedMessage = MessageSchema.safeParse(_message)
      if (!parsedMessage.success)
        return callback?.({ error: parsedMessage.error.issues })

      const message = {
        ...parsedMessage.data,
        senderId: (socket as any).decodedToken.userId,
        createdAt: new Date().toISOString(),
      }

      try {
        const job = await service.queue.chatQueue.add(message)
        const chat = await job.finished()
        callback?.({ data: chat })
      } catch (error) {
        return callback?.({ error: (error as Error).message })
      }

      const socketId = connectedUsers[message.receiverId]?.socketId
      if (socketId) {
        socket
          .to(connectedUsers[message.receiverId]?.socketId as string)
          .emit('new message', { data: message })
      } else {
        await service.push.sendPushMessage(message.receiverId, {
          title: 'New chat message',
          data: message,
        })
      }
    })

    socket.on('bookpro', async (payload: PostBookProReq, callback) => {
      try {
        //TODO: remove because of photo upload. Send fcm instead
        const data = await service.book.bookPro({
          ...payload,
          userId: (socket as any).decodedToken.userId,
        })
        callback?.({ data })
      } catch (error) {
        callback?.({ error: (error as Error).message })
      }
    })
  })

  return {
    io,
    connectedUsers,
    sendSocketNotify: (
      key: 'notification',
      userId: number,
      message: { body?: string; title?: string; userId: number },
    ) => {
      const conn = connectedUsers[userId]
      if (!conn) return false
      io.sockets.to(conn.socketId).emit(key, message)
      return true
    },
  }
}

export default createSocket
