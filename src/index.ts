import 'dotenv/config'
import 'source-map-support/register'
import http from 'http'

import createApp from './app'
import { logger } from './utils'
import createChat from './handlers/chat/socket'
import { Server } from 'socket.io'

const app = createApp()
const server = http.createServer(app)
const io = new Server(server, {
  // pingTimeout: 60000,
  cors: {
    origin: '*',
  },
})

createChat({ io })

const PORT = process.env.PORT || 4000

server.listen(PORT, () => {
  logger.info('listening on port ' + PORT)
})

export type IO = typeof io
