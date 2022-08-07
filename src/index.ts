import 'dotenv/config'
import 'source-map-support/register'

import http from 'http'
import { Server } from 'socket.io'
import createApp from './app'
import { logger } from './utils'

const app = createApp()
const server = http.createServer(app)
const io = new Server(server)

io.on('connection', (socket) => {
  console.log('a user connected')
  socket.on('disconnect', () => {
    console.log('user disconnected')
  })
})

const PORT = process.env.PORT || 4000

server.listen(PORT, () => {
  logger.info('listening on port ' + PORT)
})
