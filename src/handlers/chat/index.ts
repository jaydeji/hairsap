import { io } from '../../index'
import { logger } from '../../utils'

io.on('connection', (socket) => {
  logger.info('a user connected')
  socket.on('disconnect', () => {
    logger.info('user disconnected')
  })
})
