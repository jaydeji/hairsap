import type { Router } from 'express'
import ah from 'express-async-handler'
import type { Repo, Service } from '../types'
import crypto from 'crypto'
import { logger } from '../utils'
import { paymentQueue } from '../config/queue'
import { ForbiddenError, NotFoundError } from '../utils/Error'
import { auth } from '../middleware/auth'
import { z } from 'zod'
import { PAYSTACK_URL } from '../config/constants'
import got from 'got-cjs'

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
  router.post(
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
      //TODO frontend should add "custom_fields" with invoiceitems to metadata
      const userId = req.body?.data?.metadata?.userId
      paymentQueue.add({
        userId: userId ? +userId : undefined,
        email: req.body?.data?.customer?.email,
        event: req.body?.event,
        reason: req.body?.data?.reason,
        data: req.body,
      })

      res.sendStatus(200)
    }),
  )
  router.get(
    '/verify_transaction',
    auth({ repo }),
    ah(async (req, res) => {
      z.object({ reference: z.string() }).parse({
        reference: req.query.reference,
      })

      try {
        await got(PAYSTACK_URL + '/transaction/verify/' + req.query.reference, {
          headers: {
            Authorization: 'Bearer ' + process.env.PAYMENT_SECRET,
          },
        }).json()
      } catch (error) {
        logger.err((error as any).message)
        throw new NotFoundError()
      }

      res.status(200).send()
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
      const data = await service.other.getNotifications(
        req.tokenData?.userId as number,
      )
      res.status(200).send({ data })
    }),
  )

  return router
}

export default makeRouter
