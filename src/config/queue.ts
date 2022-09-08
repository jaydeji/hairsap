import Queue from 'bull'
import { sendMail } from './email'
import { SendMailOptions } from 'nodemailer'
import { logger } from '../utils'
import db from '../config/db'
import { ChatMessageType } from '../schemas/models/Message'
import got from 'got-cjs'
import { PAYSTACK_URL } from './constants'
import { sendSocketNotify } from '../handlers/chat/socket'
import {
  deactivateProByStarRating,
  deactivateProByTaskTargetEveryWeek,
  deactivateProByWeeklyReturningRatio,
  deactivateProNonRedeems,
  terminateDeactivatedUsers,
} from '../repo/pro/utils'
import makeRepo from '../repo'

const redisUrl = process.env.REDIS_URL as string

type Payment = {
  userId?: number
  email?: string
  event?: string
  reason?: string
  data: {
    data?: {
      metadata?: Record<string, any>
      authorization?: Record<string, any>
      [key: string]: any
    }
  }
}
const repo = makeRepo({ db })
const emailQueue = new Queue<SendMailOptions>('email', redisUrl)
const phoneQueue = new Queue('phone', redisUrl)
const paymentQueue = new Queue<Payment>('payment', redisUrl)
const chatQueue = new Queue<ChatMessageType>('chat', redisUrl)
const notifyQueue = new Queue<{
  title?: string
  body?: string
  userId: number
}>('notifications', redisUrl)
const paymentThreshold = new Queue('payment_threshold', redisUrl)
const deactivateQueue = new Queue('deactivate', redisUrl)
const deactivateRedeem = new Queue<{ proId: number }>(
  'deactivate_redeem',
  redisUrl,
)
deactivateQueue.add(undefined, { repeat: { cron: '59 59 23 * * 7' } }) //every sunday night by 23:59:59

deactivateRedeem.process(async (job, done) => {
  try {
    await deactivateProNonRedeems({ db, repo, proId: job.data.proId })
  } catch (error) {
    logger.err(error)
  }
  done()
})

deactivateQueue.process(async (_, done) => {
  try {
    await deactivateProByTaskTargetEveryWeek({ db })
    await deactivateProByStarRating({ db })
    await deactivateProByWeeklyReturningRatio({ db })
    await terminateDeactivatedUsers({ db })
  } catch (error) {
    logger.err(error)
  }
  done()
})

notifyQueue.process(async (job, done) => {
  const sent = sendSocketNotify('notification', job.data.userId, {
    body: job.data.body,
    title: job.data.title,
    userId: job.data.userId,
  })
  if (!sent) {
    // TODO: send fcm
  }
  try {
    await db.notification.create({
      data: {
        body: job.data.body,
        title: job.data.title,
        userId: job.data.userId,
      },
    })
  } catch (error) {
    logger.err((error as any).message)
  }
  done()
})

emailQueue.process(async (job, done) => {
  if (process.env.NODE_ENV !== 'production') return done()
  sendMail(job.data).catch((error) => {
    logger.err(error.message)
  })
  done()
})

phoneQueue.process(async (job, done) => {
  if (process.env.NODE_ENV !== 'production') return done()
  //  TODO send test message
})

chatQueue.process(async (job, done) => {
  try {
    await db.chat.create({
      data: job.data,
    })
  } catch (error) {
    logger.err((error as any).message)
  }
  done()
})

paymentQueue.process(async (job, done) => {
  try {
    await db.paymentEvents.create({ data: job.data })
    if (job.data?.event === 'charge.success') {
      const _invoiceId = job.data?.data?.data?.metadata?.invoiceId
      const invoiceId = _invoiceId ? +_invoiceId : undefined
      const amountPaid = job.data?.data?.data?.amount
      const reference = job.data?.data?.data?.reference

      if (invoiceId && amountPaid) {
        const invoice = await db.invoice.findUnique({
          where: {
            invoiceId,
          },
          include: {
            invoiceFees: true,
          },
        })
        if (invoice && invoice.paid !== true) {
          const total =
            (invoice?.invoiceFees.reduce((acc, e) => acc + e.price, 0) || 0) +
            invoice.transportFee
          await db.invoice.update({
            where: {
              invoiceId,
            },
            data: {
              amountPaid,
              reference,
              paid: amountPaid >= total,
              channel: 'card',
            },
          })
        }
      }
      const authorization = job.data?.data?.data?.authorization
      if (
        job.data?.data?.data?.metadata?.store === 'true' &&
        authorization?.reusable === true &&
        authorization?.authorization_code &&
        job.data?.userId &&
        job.data.email
      ) {
        const dt = {
          authorization,
          authorizationCode: authorization.authorization_code,
          last4: authorization.last4,
          bank: authorization.bank,
          brand: authorization.brand,
          expiryYear: authorization.exp_year,
          expiryMonth: authorization.exp_month,
        }
        await db.user.update({
          data: {
            card: {
              upsert: {
                create: {
                  email: job.data.email,
                  ...dt,
                },
                update: dt,
              },
            },
          },
          where: {
            userId: job.data?.userId,
          },
        })

        if (amountPaid === 5000) {
          await got.post(PAYSTACK_URL + '/refund', {
            headers: {
              Authorization: 'Bearer ' + process.env.PAYMENT_SECRET,
            },
            json: {
              transaction: reference,
              amount: amountPaid,
            },
          })
        }
      }
    } else {
      logger.info(job.data)
    }
  } catch (error) {
    logger.err(error)
  }

  done()
})

export {
  emailQueue,
  paymentThreshold,
  phoneQueue,
  paymentQueue,
  chatQueue,
  notifyQueue,
  deactivateRedeem,
}
