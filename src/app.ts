import express, { Router } from 'express'
import makeAuthRouter from './handlers/auth'
import makeServices from './services'
import makeRepo from './repo'
import db from './config/db'
import compression from 'compression'
import helmet from 'helmet'
import cors from 'cors'
import swaggerUi from 'swagger-ui-express'
import swaggerDocument from '../docs/swagger.yml'
import { handleError } from './utils/Error'
import makeUserRouter from './handlers/user'
import auth from './middleware/auth'

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
  app.get('/', (req, res) => {
    res.send('welcome to hairsap')
  })
  app.use('/auth', makeAuthRouter({ router, service }))
  app.use('/user', auth(), makeUserRouter({ router, service }))
  app.use(handleError)

  return app
}

export default createApp
