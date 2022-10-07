import type { Router } from 'express'
import ah from 'express-async-handler'
import { ROLES } from '../../config/constants'
import { allowOnly, auth } from '../../middleware/auth'
import type { Repo, Service } from '../../types'

//TODO:

const makeAuthRouter = ({
  router,
  service,
  repo,
}: {
  router: Router
  service: Service
  repo: Repo
}) => {
  router.post(
    '/login',
    ah(async (req, res) => {
      const data = await service.auth.login(req.body)
      res.status(200).send({ data })
    }),
  )

  router.post(
    '/signup',
    ah(async (req, res) => {
      const data = await service.auth.signUp(req.body)
      res.status(200).send({ data })
    }),
  )

  router.post(
    '/generateotp',
    auth({ repo }),
    allowOnly([ROLES.USER, ROLES.PRO]),
    ah(async (req, res) => {
      const data = await service.auth.generateOtp(req.body)
      res.status(200).send({ data })
    }),
  )

  router.post(
    '/validateotp',
    auth({ repo }),
    allowOnly([ROLES.USER, ROLES.PRO]),
    ah(async (req, res) => {
      const data = await service.auth.validateOtp(req.body)
      res.status(200).send({ data })
    }),
  )

  router.post(
    '/changepassword',
    auth({ repo }),
    ah(async (req, res) => {
      await service.auth.changePassword({
        userId: req.tokenData?.userId,
        ...req.body,
      })
      res.status(201).send()
    }),
  )

  router.post(
    '/resetpassword',
    ah(async (req, res) => {
      await service.auth.resetPassword(req.body)
      res.status(201).send()
    }),
  )

  router.post(
    '/confirmresetpassword',
    ah(async (req, res) => {
      await service.auth.confirmResetPassword(req.body)
      res.status(201).send()
    }),
  )

  return router
}

export default makeAuthRouter
