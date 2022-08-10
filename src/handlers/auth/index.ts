import type { Router } from 'express'
import ah from 'express-async-handler'
import type { Role, Service } from '../../types'

//TODO:

const makeAuthRouter = ({
  router,
  service,
}: {
  router: Router
  service: Service
}) => {
  router.post(
    '/login',
    ah(async (req, res) => {
      const data = await service.auth.login(req.body, req.query.role as Role)
      res.status(200).send({ data })
    }),
  )

  router.post(
    '/signup',
    ah(async (req, res) => {
      const data = await service.auth.signup(req.body, req.query.role as Role)
      res.status(200).send({ data })
    }),
  )

  router.post(
    '/validateotp',
    ah(async (req, res) => {
      const data = await service.auth.validateOtp(req.body)
      res.status(200).send({ data })
    }),
  )

  return router
}

export default makeAuthRouter
