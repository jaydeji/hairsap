import type { Router } from 'express'
import ah from 'express-async-handler'
import type { Repo, Service } from '../types'
import crypto from 'crypto'
import { logger } from '../utils'
import { paymentQueue } from '../config/queue'
import { ForbiddenError } from '../utils/Error'
import { auth } from '../middleware/auth'

const makeRouter = ({
  router,
  service,
  repo,
}: {
  router: Router
  service: Service
  repo: Repo
}) => {
  router.get(
    '/',
    ah((_req, res) => {
      res.send('welcome to hairsap')
    }),
  )
  router.get(
    '/webhook/paystack',
    ah((req, res) => {
      const secret = process.env.PAYMENT_SECRET as string
      const hash = crypto
        .createHmac('sha512', secret)
        .update(JSON.stringify(req.body))
        .digest('hex')
      if (hash !== req.headers['x-paystack-signature']) {
        logger.info(req.body)
        throw new ForbiddenError()
      }
      paymentQueue.add({
        userId: null,
        event: req.body.event,
        reason: req.body.reason,
        data: req.body.data,
      })
      res.sendStatus(200)
    }),
  )
  router.get(
    '/services',
    auth({ repo }),
    ah(async (_req, res) => {
      const data = await service.other.getServices()
      res.status(200).send({ data })
    }),
  )
  router.get(
    '/notifications',
    auth({ repo }),
    ah(async (req, res) => {
      const data = await service.other.getNotifications({
        userId: req.tokenData?.userId as number,
        proId: req.tokenData?.proId as number,
        adminId: req.tokenData?.adminId as number,
      })
      res.status(200).send({ data })
    }),
  )

  return router
}

export default makeRouter
