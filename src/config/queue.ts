import Queue from 'bull'
import { sendMail } from './email'
import { SendMailOptions } from 'nodemailer'
import { logger } from '../utils'
import db from '../config/db'
import { ChatMessageType } from '../schemas/models/Message'

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

const mainQueue = new Queue('main', redisUrl)
const emailQueue = new Queue<SendMailOptions>('email', redisUrl)
const phoneQueue = new Queue('phone', redisUrl)
const paymentQueue = new Queue<Payment>('payment', redisUrl)
const chatQueue = new Queue<ChatMessageType>('chat', redisUrl)
const paymentThreshold = new Queue('payment_threshold', redisUrl)

mainQueue.process(async (job, done) => {
  logger.info(job.id, job.data)
  done()
})

emailQueue.process(async (job, done) => {
  if (process.env.NODE_ENV !== 'production') return done()
  sendMail(job.data)
    .then((_info) => {
      done()
    })
    .catch((error) => {
      logger.err(error.message)
      done()
    })
})

phoneQueue.process(async (job, done) => {
  if (process.env.NODE_ENV !== 'production') return done()
  //  TODO send test message
})

chatQueue.process(async (job, done) => {
  if (process.env.NODE_ENV !== 'production') return done()
  await db.chat.create({
    data: job.data,
  })
})

paymentQueue.process(async (job, done) => {
  try {
    await db.paymentEvents.create({ data: job.data })
    if (job.data?.event === 'charge.success') {
      const _invoiceId = job.data?.data?.data?.metadata?.invoiceId
      const invoiceId = _invoiceId ? +_invoiceId : undefined
      const amountPaid = job.data?.data?.data?.amount
      const reference = job.data?.data?.data?.reference
      logger.info({
        invoiceId,
        amountPaid,
        job: job.data?.data?.data?.metadata,
      })

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
            invoice?.invoiceFees.reduce((acc, e) => acc + e.price, 0) || 0
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
        await db.user.update({
          data: {
            card: {
              upsert: {
                create: {
                  email: job.data.email,
                  authorization,
                  authorizationCode: authorization.authorization_code,
                  last4: authorization.authorization_code.last4,
                  bank: authorization.authorization_code.bank,
                  brand: authorization.authorization_code.brand,
                },
                update: {
                  authorization,
                  authorizationCode: authorization.authorization_code,
                  last4: authorization.authorization_code.last4,
                  bank: authorization.authorization_code.bank,
                  brand: authorization.authorization_code.brand,
                },
              },
            },
          },
          where: {
            userId: job.data?.userId,
          },
        })
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
  mainQueue,
  paymentThreshold,
  phoneQueue,
  paymentQueue,
  chatQueue,
}
