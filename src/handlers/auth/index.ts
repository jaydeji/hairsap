import { emailQueue, mainQueue, paymentThreshold } from '../../config/queue'
import type { Router } from 'express'
import ah from 'express-async-handler'
import type { Service } from '../../types'
import { Role } from '@prisma/client'

//TODO:

const makeAuthRouter = ({
  router,
  service,
}: {
  router: Router
  service: Service
}) => {
  router.get(
    '/',
    ah((_req, res) => {
      res.send('Birds home page')
    }),
  )

  router.post(
    '/login',
    ah(async (req, res) => {
      const data = await service.auth.login(req.body, req.params.role as Role)
      res.status(200).send({ data })
    }),
  )

  router.post(
    '/signup',
    ah(async (req, res) => {
      const data = await service.auth.signup(req.body, req.params.role as Role)
      res.status(200).send({ data })
    }),
  )

  return router
}

export default makeAuthRouter
