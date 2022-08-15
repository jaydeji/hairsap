import express, { Router } from 'express'
import compression from 'compression'
import helmet from 'helmet'
import cors from 'cors'

import db from './config/db'
import authMiddleWare from './middleware/auth'
import adminMiddleware from './middleware/admin'
import { handleError } from './utils/Error'
import swaggerUi from 'swagger-ui-express'
import swaggerDocument from '../docs/swagger.yml'

import makeServices from './services'
import makeRepo from './repo'

import makeRouter from './handlers'
import makeAuthRouter from './handlers/auth'
import makeUserRouter from './handlers/user'
import makeChatRouter from './handlers/chat'
import makeProRouter from './handlers/pro'
import makeBookRouter from './handlers/book'
import makeAdminRouter from './handlers/admin'

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
  app.use(
    '/users',
    authMiddleWare({ repo }),
    makeUserRouter({ router, service }),
  )
  app.use('/pro', authMiddleWare({ repo }), makeProRouter({ router, service }))
  app.use(
    '/chats',
    authMiddleWare({ repo }),
    makeChatRouter({ router, service }),
  )
  app.use(
    '/book',
    authMiddleWare({ repo }),
    makeBookRouter({ router, service }),
  )
  app.use(
    '/admin',
    authMiddleWare({ repo }),
    adminMiddleware(),
    makeAdminRouter({ router, service }),
  )
  app.use('/', makeRouter({ router, service }))

  app.use(handleError)

  return app
}

export default createApp
