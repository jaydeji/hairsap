import { ROLES } from '../../config/constants'
import { IO } from '../../index'
import { ChatMessageType, MessageSchema } from '../../schemas/models/Message'
import { PostBookProReq } from '../../schemas/request/postBookPro'
import { Repo, Role, Service } from '../../types'
import { logger } from '../../utils'
import { UnauthorizedError } from '../../utils/Error'
import { verifyJwt } from '../../utils/jwtLib'

//client
// const socket = io.connect('http://localhost:3000', {
//   query: {token,role}
// });

//socket input Object<any>
//socket output Object<{data,message,error}>

const createSocket = ({
  io,
  service,
  repo,
}: {
  io: IO
  service: Service
  repo: Repo
}) => {
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
    if (process.env.NODE_ENV === 'development') {
      socket.onAny((event, ...args) => {
        logger.info({ event, args })
      })
    }

    socket.on('disconnect', () => {
      connectedUsers[(socket as any).decodedToken.userId] = undefined
    })

    // socket.on('setup', ({ userId }: { userId: number }) => {
    //   connectedUsers[userId] = {
    //     socketId: socket.id,
    //   }
    // })

    socket.on('new message', (_message: ChatMessageType, callback) => {
      sendMessage({
        callback,
        _message,
        senderId: (socket as any).decodedToken.userId,
      })
    })

    socket.on(
      'location',
      async (
        payload: { userId: number; latitude: number; longitude: number },
        callback,
      ) => {
        try {
          await repo.user.updateUser(payload.userId, payload)
        } catch (error) {
          logger.err(error, 'error updating socket location')
          callback?.({ error: 'error updating user location' })
        }
      },
    )

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

  const sendSocketNotify = (
    key: 'notification',
    userId: number,
    message: { body?: string; title?: string; userId: number },
  ) => {
    const conn = connectedUsers[userId]
    if (!conn) return false
    io.sockets.to(conn.socketId).emit(key, { data: message })
    return true
  }

  const sendMessage = async ({
    callback,
    _message,
    senderId,
  }: {
    callback?: any
    _message: ChatMessageType
    senderId: number
  }) => {
    const parsedMessage = MessageSchema.safeParse(_message)
    if (!parsedMessage.success)
      return callback?.({ error: parsedMessage.error.issues })

    const message = {
      ...parsedMessage.data,
      senderId,
      createdAt: new Date().toISOString(),
    }

    let messageWithId

    try {
      const job = await service.queue.chatQueue.add(message)
      messageWithId = await job.finished()
      callback?.({ data: messageWithId })
    } catch (error) {
      logger.err(error, 'error sending message')
      return callback?.({ error: 'error sending socket message' })
    }

    const socketId = connectedUsers[messageWithId.receiverId]?.socketId
    if (socketId) {
      io.sockets
        .to(connectedUsers[message.receiverId]?.socketId as string)
        .emit('new message', { data: messageWithId })
    } else {
      await service.push.sendPushMessage(message.receiverId, {
        title: 'New chat message',
        data: messageWithId,
      })
    }
  }

  return {
    io,
    connectedUsers,
    sendSocketNotify,
    sendMessage,
  }
}

export default createSocket
