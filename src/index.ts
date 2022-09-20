import 'dotenv/config'
import 'source-map-support/register'
import http from 'http'

import { Server } from 'socket.io'
import { Expo } from 'expo-server-sdk'

import createApp from './app'
import createSocket from './handlers/chat/socket'
import db from './config/db'
import makeRepo from './repo'
import makeServices from './services'
import { logger } from './utils'

const expo = new Expo()

const repo = makeRepo({ db })
const service = makeServices({ repo, expo })

const app = createApp({ repo, service })

const server = http.createServer(app)

const io = new Server(server, {
  // pingTimeout: 60000,
  cors: {
    origin: '*',
  },
})

export const socket = createSocket({ io, service })

const PORT = process.env.PORT || 4000

server.listen(PORT, () => {
  console.log('listening on port ' + PORT)
  logger.info('listening on port ' + PORT)
})

export type IO = typeof io
