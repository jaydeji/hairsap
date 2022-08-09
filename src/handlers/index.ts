import type { Router } from 'express'
import ah from 'express-async-handler'
import type { Service } from '../types'
import crypto from 'crypto'
import { logger } from '../utils'
import { paymentQueue } from '../config/queue'
import { ForbiddenError } from '../utils/Error'

const makeRouter = ({
  router,
  service,
}: {
  router: Router
  service: Service
}) => {
  router.get(
    '/',
    ah((req, res) => {
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

  return router
}

export default makeRouter
