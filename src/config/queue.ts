import Queue from 'bull'
import { sendMail } from './email'
import { SendMailOptions } from 'nodemailer'
import { logger } from '../utils'
import db from '../config/db'

const mainQueue = new Queue('main', process.env.REDIS_URL as string)
const emailQueue = new Queue<SendMailOptions>(
  'email',
  process.env.REDIS_URL as string,
)
const phoneQueue = new Queue('phone', process.env.REDIS_URL as string)
const paymentQueue = new Queue('payment', process.env.REDIS_URL as string)
const paymentThreshold = new Queue(
  'payment_threshold',
  process.env.REDIS_URL as string,
)

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

paymentQueue.process(async (job, done) => {
  await db.paymentEvents.create(job.data)
  if (job.data?.event === 'paymentrequest.success') {
    //TODO: mark payment as confirmed
  }
  done()
})

export { emailQueue, mainQueue, paymentThreshold, phoneQueue, paymentQueue }
