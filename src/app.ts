import express, { Router } from 'express'
import compression from 'compression'
import helmet from 'helmet'
import cors from 'cors'

import db from './config/db'
import auth from './middleware/auth'
import { handleError } from './utils/Error'
import swaggerUi from 'swagger-ui-express'
import swaggerDocument from '../docs/swagger.yml'

import makeServices from './services'
import makeRepo from './repo'

import makeAuthRouter from './handlers/auth'
import makeUserRouter from './handlers/user'
import makeChatRouter from './handlers/chat'
import makeRouter from './handlers'

const createApp = () => {
  const repo = makeRepo({ db })
  const service = makeServices({ repo })

  const app = express()
  const router = Router()

  app.use(compression())
  app.use(helmet())
  app.use(express.json())
  //TODO: tighten cors
  app.use(cors())
  app.use('/reference', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
  app.use('/auth', makeAuthRouter({ router, service }))
  app.use('/users', auth(), makeUserRouter({ router, service }))
  app.use('/chats', auth(), makeChatRouter({ router, service }))
  app.use('/', makeRouter({ router, service }))

  app.use(handleError)

  return app
}

export default createApp
