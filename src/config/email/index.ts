import nodemailer from 'nodemailer'

const MAIL_PORT = Number(process.env.MAIL_PORT || 0)

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST as string,
  port: MAIL_PORT,
  secure: process.env.MAIL_SECURE === 'true' || MAIL_PORT === 465,
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  },
})

const sendMail = transporter.sendMail.bind(transporter)

export { sendMail }
