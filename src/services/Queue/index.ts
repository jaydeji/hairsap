import Queue from 'bull'
import { sendMail } from '../../config/email'
import { SendMailOptions } from 'nodemailer'
import { logger } from '../../utils'
import db from '../../config/db'
import { ChatMessageType } from '../../schemas/models/Message'
import got from 'got-cjs'
import { PAYSTACK_URL } from '../../config/constants'
import {
  deactivateProByStarRating,
  deactivateProByTaskTargetEveryWeek,
  deactivateProByWeeklyReturningRatio,
  deactivateProNonRedeems,
  terminateDeactivatedUsers,
} from '../../repo/pro/utils'
import { socket } from '../../index'
import { BookingStatus, Repo } from '../../types'
import { Push } from '../Push'

const redisUrl = process.env.REDIS_URL

export type Payment = {
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

const options = {
  defaultJobOptions: { removeOnComplete: true },
}

const makeQueue = ({ repo, push }: { repo: Repo; push: Push }) => {
  const emailQueue = new Queue<SendMailOptions>('email', redisUrl, options)
  const phoneQueue = new Queue<{ phone: string; body: string }>(
    'phone',
    redisUrl,
    options,
  )
  const paymentQueue = new Queue<Payment>('payment', redisUrl, options)
  const chatQueue = new Queue<
    ChatMessageType & { createdAt: string; senderId: number }
  >('chat', redisUrl, options)
  const notifyQueue = new Queue<{
    title?: string
    body?: string
    userId: number
  }>('notifications', redisUrl, options)
  const deactivateQueue = new Queue('deactivate', redisUrl, options)
  const deactivateRedeem = new Queue<{ proId: number }>(
    'deactivate_redeem',
    redisUrl,
    options,
  )
  const bookingQueue = new Queue<{
    userId: number
    status: BookingStatus | 'in transit' | 'arrived'
    bookingId: number
  }>('booking', redisUrl, options)

  deactivateQueue.add(undefined, {
    repeat: { cron: '00 00 21 * * 7' },
  }) //every sunday night by 9pm

  // paymentThreshold.add(
  //   { email: req.body.email },
  //   {
  //     attempts: 3,
  //     backoff: {
  //       type: 'exponential',
  //       delay: 5000,
  //     },
  //     delay: 60 * 60 * 24 * 2 * 1000,
  //     // repeat: {
  //     //   cron: '',
  //     //   startDate: new Date(),
  //     // },
  //     // timeout
  //   },
  // )

  deactivateRedeem.process(async (job, done) => {
    try {
      await deactivateProNonRedeems({ db, repo, proId: job.data.proId })
    } catch (error) {
      logger.err(error, 'Deactivate Redeem Error')
      done(error as Error)
      return
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
      done(error as Error)
      return
    }
    done()
  })

  notifyQueue.process(async (job, done) => {
    const sent = socket.sendSocketNotify('notification', job.data.userId, {
      body: job.data.body,
      title: job.data.title,
      userId: job.data.userId,
    })
    if (!sent) {
      push.sendPushMessage(job.data.userId, {
        title: job.data.title,
        data: {
          body: job.data.body,
          title: job.data.title,
          userId: job.data.userId,
        },
      })
    }
    try {
      await repo.other.createNotification({
        body: job.data.body,
        title: job.data.title,
        userId: job.data.userId,
      })
    } catch (error) {
      logger.err(error, 'Error creating notification')
      done(error as Error)
      return
    }
    done()
  })

  emailQueue.process(async (job) => {
    if (!['production', 'staging'].includes(process.env.NODE_ENV))
      return Promise.resolve()

    sendMail(job.data).catch((error) => {
      logger.err(error, 'Error sending mail')
      return Promise.reject(error)
    })
    return Promise.resolve()
  })

  phoneQueue.process(async (job, done) => {
    // if (!['production', 'staging'].includes(process.env.NODE_ENV))
    //   return done()

    done()
    return

    // const SMS_URL = 'https://www.bulksmsnigeria.com/api/v1/sms/create'

    // try {
    //   await got.post(SMS_URL, {
    //     searchParams: {
    //       api_token: process.env.SMS_API_TOKEN,
    //       from: 'Hairsap',
    //       to: job.data.phone,
    //       body: job.data.body,
    //     },
    //   })
    // } catch (error) {
    //   console.log((error as HTTPError).response.body)
    // }
  })

  chatQueue.process(async (job, done) => {
    try {
      const chat = await db.chat.create({
        data: job.data,
      })
      done(null, chat)
      return
    } catch (error) {
      logger.err(error, 'Error in chat queue')
      done(error as Error)
      return
    }
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
          amountPaid === 5000 &&
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
      } else {
        logger.info(job.data, 'payment queue not charge.success')
      }
    } catch (error) {
      logger.err(error, 'Error in payment queue')
      done(error as Error)
      return
    }

    done()
  })

  bookingQueue.process(async (job, done) => {
    socket.sendSocketBooking(job.data.userId, job.data)
    done()
  })

  return {
    emailQueue,
    phoneQueue,
    paymentQueue,
    chatQueue,
    notifyQueue,
    deactivateRedeem,
    deactivateQueue,
    bookingQueue,
  }
}

export type Queue = ReturnType<typeof makeQueue>

export default makeQueue
