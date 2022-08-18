import Queue from 'bull'
import { sendMail } from './email'
import { SendMailOptions } from 'nodemailer'
import { logger } from '../utils'
import db from '../config/db'
import { ChatMessageType } from '../schemas/models/Message'

const redisUrl = process.env.REDIS_URL as string

const mainQueue = new Queue('main', redisUrl)
const emailQueue = new Queue<SendMailOptions>('email', redisUrl)
const phoneQueue = new Queue('phone', redisUrl)
const paymentQueue = new Queue('payment', redisUrl)
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
  //  TODO: send test message
})

chatQueue.process(async (job, done) => {
  if (process.env.NODE_ENV !== 'production') return done()
  await db.chat.create({
    data: job.data,
  })
})

paymentQueue.process(async (job, done) => {
  await db.paymentEvents.create(job.data)
  if (job.data?.event === 'paymentrequest.success') {
    //TODO: mark payment as confirmed
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
