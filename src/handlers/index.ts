import type { Router } from 'express'
import ah from 'express-async-handler'
import type { Repo, Service } from '../types'
import crypto from 'crypto'
import { logger } from '../utils'
import { ForbiddenError, NotFoundError } from '../utils/Error'
import { allowOnly, auth } from '../middleware/auth'
import { z } from 'zod'
import { PAYSTACK_URL, ROLES } from '../config/constants'
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
  router.get(
    '/health',
    ah(async (_req, res) => {
      await service.other.healthCheck()
      res.status(200).send()
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
        logger.err((error as any).response, 'Paystack verification error')
        throw new NotFoundError()
      }

      res.status(200).send()
    }),
  )
  router.get(
    '/services',
    // auth({ repo }),
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
  router.post(
    '/deactivate',
    auth({ repo }),
    allowOnly([ROLES.USER, ROLES.PRO]),
    ah(async (req, res) => {
      await service.other.deactivateUserOrPro({
        userId: req.tokenData?.userId as number,
      })
      res.status(201).send()
    }),
  )

  router.post(
    '/webhook/paystack',
    ah((req, res) => {
      logger.info('paystack webhook')
      const secret = process.env.PAYMENT_SECRET
      const hash = crypto
        .createHmac('sha512', secret)
        .update(JSON.stringify(req.body))
        .digest('hex')
      if (hash !== req.headers['x-paystack-signature']) {
        logger.info(req.body, 'paystack webhook signature fail')
        throw new ForbiddenError()
      }
      //TODO backend should add "custom_fields" with invoiceitems to metadata
      const userId = req.body?.data?.metadata?.userId
      service.queue.paymentQueue.add({
        userId: userId ? +userId : undefined,
        email: req.body?.data?.customer?.email,
        event: req.body?.event,
        reason: req.body?.data?.reason,
        data: req.body,
      })

      res.sendStatus(200)
    }),
  )

  router.post(
    '/pushtoken/:token',
    auth({ repo }),
    ah(async (req, res) => {
      await service.other.setPushToken(
        req.tokenData?.userId as number,
        req.params.token as string,
      )
      res.status(201).send()
    }),
  )

  return router
}

export default makeRouter
