import { ROLES } from '../../config/constants'
import { chatQueue } from '../../config/queue'
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

const users: Record<string, { socketId: string } | undefined> = {}

const createChat = ({ io, service }: { io: IO; service: Service }) => {
  io.use(function (socket, next) {
    if (socket.handshake.query?.token && socket.handshake.query?.role) {
      try {
        const tokenData = verifyJwt(
          socket.handshake.query.token as string,
          (socket.handshake.query?.role as Role) === ROLES.ADMIN,
        )
        ;(socket as any).decodedToken = tokenData
        next()
      } catch (error) {
        next(new UnauthorizedError())
      }
    } else {
      next(new UnauthorizedError())
    }
  })
  io.on('connection', (socket) => {
    logger.info('a user connected')

    if (process.env.NODE_ENV === 'development') {
      socket.onAny((event, ...args) => {
        logger.info({ event, args })
      })
    }

    socket.on('disconnect', () => {
      users[(socket as any).decodedToken.userId] = undefined
      logger.info('user disconnected')
    })

    socket.on('setup', (userId: number) => {
      users[userId] = {
        socketId: socket.id,
      }
    })

    socket.on('new message', (message: ChatMessageType) => {
      const _message = MessageSchema.safeParse(message)
      if (!_message.success) return
      chatQueue.add(message)
      const socketId = users[message.receiverId]?.socketId
      if (socketId) {
        socket
          .to(users[message.receiverId]?.socketId as string)
          .emit('new message', message)
      } else {
        // TODO: send FCM
      }
    })

    socket.on('bookpro', async (payload: PostBookProReq) => {
      try {
        //TODO: add auth middleware
        const data = await service.book.bookPro({
          ...payload,
          userId: (socket as any).decodedToken.userId,
        })
        socket.emit('bookpro', { data })
      } catch (error) {
        socket.emit('bookpro', { error: (error as Error).message })
      }
    })
  })
}

export default createChat
