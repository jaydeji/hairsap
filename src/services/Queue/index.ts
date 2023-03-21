import Queue, { QueueOptions } from 'bull'
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
import { BookingStatus, Notificationtype, Repo } from '../../types'
import { Push } from '../Push'
import { resolveAmount } from '../Book/util'

const redisUrl = process.env.REDIS_URL

export type Payment = {
  userId?: number
  email?: string
  event?: string
  reason?: string
  data: {
    data?: {
      metadata?: Record<string, unknown> & {
        invoiceId?: string
      }
      authorization?: Record<string, any>
      [key: string]: any
    }
  }
}

const options: QueueOptions = {
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
    type: Notificationtype
    title?: string
    body?: string
    userId: number
    [key: string]: any
  }>('notifications', redisUrl, options)
  const deactivateQueue = new Queue('deactivate', redisUrl, options)
  const deactivateRedeem = new Queue<{ proId: number }>(
    'deactivate_redeem',
    redisUrl,
    options,
  )

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
    logger.info('deactivation started')
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
    logger.info('deactivation done')
    done()
  })

  notifyQueue.process(async (job, done) => {
    const { body, title, userId, ...rest } = job.data
    const sent = socket.sendSocketNotify('notification', userId, {
      body,
      title,
      userId,
      ...rest,
    })
    if (!sent) {
      push.sendPushMessage(userId, {
        title,
        body,
        data: {
          body,
          title,
          userId,
          ...rest,
        },
      })
    }
    try {
      await repo.other.createNotification({
        body,
        title,
        userId,
      })
    } catch (error) {
      logger.err(error, 'Error creating notification')
      done(error as Error)
      return
    }
    done()
  })

  emailQueue.process((job, done) => {
    if (!['production', 'staging'].includes(process.env.NODE_ENV)) return done()

    sendMail(job.data).catch((error) => {
      logger.err(error, 'Error sending mail')
    })
    done()
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
              promo: true,
              booking: { select: { pinAmount: true } },
            },
          })
          if (invoice && invoice.paid !== true) {
            let discount
            if (invoice.promo?.promoId) {
              const promo = await repo.other.getPromoByCode(invoice.promo.code)
              if (promo)
                discount = await repo.other.getDiscountById(promo.discountId)
            }

            const { total } = resolveAmount({
              invoice:
                invoice?.invoiceFees.reduce((acc, e) => acc + e.price, 0) || 0,
              transport: invoice.transportFee,
              code: discount?.name,
              pinAmount: invoice.booking.pinAmount,
            })

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

  return {
    emailQueue,
    phoneQueue,
    paymentQueue,
    chatQueue,
    notifyQueue,
    deactivateRedeem,
    deactivateQueue,
  }
}

export type Queue = ReturnType<typeof makeQueue>

export default makeQueue
