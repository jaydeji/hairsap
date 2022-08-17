import express, { Router } from 'express'
import compression from 'compression'
import helmet from 'helmet'
import cors from 'cors'

import { auth as authMiddleWare, allowOnly } from './middleware/auth'
import { handleError } from './utils/Error'
import swaggerUi from 'swagger-ui-express'
import swaggerDocument from '../docs/swagger.yml'

import makeRouter from './handlers'
import makeAuthRouter from './handlers/auth'
import makeUserRouter from './handlers/user'
import makeChatRouter from './handlers/chat'
import makeProRouter from './handlers/pro'
import makeBookRouter from './handlers/book'
import makeAdminRouter from './handlers/admin'

import { ROLES } from './config/constants'
import { Repo, Service } from './types'

const createApp = ({ repo, service }: { repo: Repo; service: Service }) => {
  const app = express()

  app.use(compression())
  app.use(helmet())
  app.use(express.json())
  //TODO: tighten cors
  app.use(cors())
  app.use('/reference', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
  app.use('/auth', makeAuthRouter({ router: Router(), service }))
  app.use(
    '/users',
    authMiddleWare({ repo }),
    makeUserRouter({ router: Router(), service }),
  )
  app.use(
    '/pro',
    authMiddleWare({ repo }),
    makeProRouter({ router: Router(), service }),
  )
  app.use(
    '/chats',
    authMiddleWare({ repo }),
    makeChatRouter({ router: Router(), service }),
  )
  app.use(
    '/book',
    authMiddleWare({ repo }),
    makeBookRouter({ router: Router(), service }),
  )
  app.use(
    '/admin',
    authMiddleWare({ repo }),
    allowOnly([ROLES.ADMIN]),
    makeAdminRouter({ router: Router(), service }),
  )
  app.use('/', makeRouter({ router: Router(), service, repo }))

  app.use(handleError)

  return app
}

export default createApp
