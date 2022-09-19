import express, { Router } from 'express'
import compression from 'compression'
import helmet from 'helmet'
import cors from 'cors'
import fileUpload from 'express-fileupload'
import { auth as authMiddleWare, allowOnly } from './middleware/auth'
import { handleError } from './utils/Error'
import swaggerUi from 'swagger-ui-express'
import YAML from 'yamljs'
import { ROLES } from './config/constants'
import { Repo, Service } from './types'

import makeRouter from './handlers'
import makeAuthRouter from './handlers/auth'
import makeUserRouter from './handlers/user'
import makeChatRouter from './handlers/chat'
import makeProRouter from './handlers/pro'
import makeBookRouter from './handlers/book'
import makeAdminRouter from './handlers/admin'

const createApp = ({ repo, service }: { repo: Repo; service: Service }) => {
  const app = express()

  app.use(compression())
  app.use(
    helmet({
      contentSecurityPolicy:
        process.env.NODE_ENV === 'production' ? true : false,
    }),
  )
  app.use(express.json())
  app.use(fileUpload())
  //TODO: tighten cors
  app.use(cors({ origin: '*', methods: '*', allowedHeaders: '*' }))
  app.use('/sockets', express.static(process.cwd() + '/docs/asyncapi'))
  app.use(
    '/reference',
    swaggerUi.serve,
    swaggerUi.setup(YAML.load(process.cwd() + '/docs/swagger.yml')),
  )
  app.use('/auth', makeAuthRouter({ router: Router(), service, repo }))
  app.use(
    '/users',
    authMiddleWare({ repo }),
    makeUserRouter({ router: Router(), service }),
  )
  app.use(
    '/pros',
    authMiddleWare({ repo }),
    makeProRouter({ router: Router(), service }),
  )
  app.use(
    '/chats',
    authMiddleWare({ repo }),
    makeChatRouter({ router: Router(), service }),
  )
  app.use(
    '/bookings',
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

  service.queue.emailQueue.add({
    from: '"Hairsap" <jide@hairsap.com>',
    to: 'jideadedejifirst@gmail.com',
    subject: 'Test New SignUp',
    text: `A password reset has been initiated. Please use this token  which expires in 1 hour`,
    html: `A password reset has been initiated. Please use this token  which expires in 1 hour`,
  })

  return app
}

export default createApp
