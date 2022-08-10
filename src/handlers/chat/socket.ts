import { z } from 'zod'
import { MESSAGE_TYPE, ROLES } from '../../config/constants'
import { chatQueue } from '../../config/queue'
import { IO } from '../../index'
import { Role } from '../../types'
import { logger } from '../../utils'
import { UnauthorizedError } from '../../utils/Error'
import { verifyJwt } from '../../utils/jwtLib'

//client
// const socket = io.connect('http://localhost:3000', {
//   query: {token,role}
// });

const users: Record<string, { socketId: string } | undefined> = {}

const MessageSchema = z
  .object({
    createdAt: z
      .string()
      .refine((str) =>
        str.match(
          new RegExp(
            /(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))/,
          ),
        ),
      ),
    text: z.string().optional(),
    photo: z.string().optional(),
    senderId: z.number(),
    receiverId: z.number(),
    messageType: z.nativeEnum(MESSAGE_TYPE),
  })
  .strict()

export type ChatMessageType = z.infer<typeof MessageSchema>

const createChat = ({ io }: { io: IO }) => {
  io.use(function (socket, next) {
    if (socket.handshake.query?.token && socket.handshake.query?.role) {
      try {
        const tokenData = verifyJwt(
          socket.handshake.query.token as string,
          (socket.handshake.query?.role as Role) === ROLES.ADMIN,
        )
        ;(socket as any).decoded = tokenData
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
      users[(socket as any).decoded.userId] = undefined
      logger.info('user disconnected')
    })

    socket.on('setup', (userId: number) => {
      users[userId] = {
        socketId: socket.id,
      }
    })

    socket.on('new message', ({ message }: { message: ChatMessageType }) => {
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
  })
}

export default createChat
