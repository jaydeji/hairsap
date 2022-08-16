import 'dotenv/config'
import 'source-map-support/register'
import http from 'http'

import createApp from './app'
import { logger } from './utils'
import createChat from './handlers/chat/socket'
import { Server } from 'socket.io'
import db from './config/db'
import makeRepo from './repo'
import makeServices from './services'

const repo = makeRepo({ db })
const service = makeServices({ repo })

const app = createApp({ repo, service })

const server = http.createServer(app)

const io = new Server(server, {
  // pingTimeout: 60000,
  cors: {
    origin: '*',
  },
})

createChat({ io, service })

const PORT = process.env.PORT || 4000

server.listen(PORT, () => {
  logger.info('listening on port ' + PORT)
})

export type IO = typeof io
