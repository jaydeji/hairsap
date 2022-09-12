import { ADMIN_ID, OTP_TYPE, ROLES } from '../../config/constants'
import {
  otpEmailTemplate,
  signUpEmailTemplate,
} from '../../config/email/templates/signup'
import { emailQueue, phoneQueue } from '../../config/queue'
import {
  PostSignupProRequest,
  PostSignupProRequestSchema,
  PostSignupUserRequest,
  PostSignupUserRequestSchema,
} from '../../schemas/request/postSignup'
import { hashPassword, dayjs } from '../../utils'

import type { Repo } from '../../types'
import { ForbiddenError, ValidationError } from '../../utils/Error'
import { PostLoginResponseSchema } from '../../schemas/response/postLogin'

import { generateLoginOtp } from '../../utils/otp'
import { generateJwt } from '../../utils/jwtLib'

const signupUser = async (repo: Repo, body: PostSignupUserRequest) => {
  PostSignupUserRequestSchema.parse(body)

  const userWithEmail = await repo.user.getUserByEmail(body.email)
  const userWithPhone = await repo.user.getUserByPhone(body.phone)

  if (userWithEmail && userWithEmail.role === ROLES.USER)
    throw new ValidationError('user with this email already exists')
  if (userWithPhone && userWithPhone.role === ROLES.USER)
    throw new ValidationError('user with this phone number already exists')

  const hashedPassword = hashPassword(body.password)

  let otp
  if (body.otpType) otp = await generateLoginOtp()

  const user = await repo.user.createUser({
    ...body,
    password: hashedPassword,
    otp: otp
      ? {
          create: {
            value: otp,
            expiredAt: dayjs().add(10, 'm').toDate(),
          },
        }
      : undefined,
  })

  emailQueue.add(signUpEmailTemplate(user.name))

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

  const token = generateJwt(
    { email: user.email, role: user.role, userId: user.userId },
    false,
    {
      expiresIn: String(dayjs.duration({ days: 30 }).as('ms')),
    },
  )

  if (otp) {
    if (body.otpType === OTP_TYPE.PHONE) {
      phoneQueue.add({
        phone: user.phone,
        body: `Please use the OTP: ${otp} to complete your signup - Hairsap`,
      })
    }
    if (body.otpType === OTP_TYPE.EMAIL) {
      emailQueue.add(
        otpEmailTemplate({ name: user.name, email: user.email, otp }),
      )
    }
  }

  await repo.other.createNotification({
    userId: ADMIN_ID,
    title: `New User`,
    body: `A new user with name ${user.name} has signed up`,
  })

  return { user: PostLoginResponseSchema.parse(user), otp, token }
}

const signupPro = async (repo: Repo, body: PostSignupProRequest) => {
  PostSignupProRequestSchema.parse(body)

  const proWithEmail = await repo.user.getUserByEmail(body.email)
  const proWithPhone = await repo.user.getUserByPhone(body.phone)

  if (proWithEmail && proWithEmail.role === ROLES.PRO)
    throw new ValidationError('pro with this email already exists')
  if (proWithPhone && proWithPhone.role === ROLES.PRO)
    throw new ValidationError('pro with this phone number already exists')

  const hashedPassword = hashPassword(body.password)

  let otp
  if (body.otpType) otp = await generateLoginOtp()

  const pro = await repo.user.createUser({
    ...body,
    password: hashedPassword,
    otp: otp
      ? {
          create: {
            value: otp,
            expiredAt: dayjs().add(10, 'm').toDate(),
          },
        }
      : undefined,
  })

  emailQueue.add(signUpEmailTemplate(pro.name))

  const token = generateJwt(
    { email: pro.email, role: pro.role, userId: pro.userId },
    false,
    {
      expiresIn: String(dayjs.duration({ days: 30 }).as('ms')),
    },
  )

  if (otp) {
    if (body.otpType === OTP_TYPE.PHONE) {
      phoneQueue.add({
        phone: pro.phone,
        body: `Please use the OTP: ${otp} to complete your signup - Hairsap`,
      })
    }
    if (body.otpType === OTP_TYPE.EMAIL) {
      emailQueue.add(
        otpEmailTemplate({ name: pro.name, email: pro.email, otp }),
      )
    }
  }

  await repo.other.createNotification({
    userId: ADMIN_ID,
    title: `New Pro`,
    body: `A new pro with name ${pro.name} has signed up`,
  })

  return { pro: PostLoginResponseSchema.parse(pro), otp, token }
}

export const signUp =
  ({ repo }: { repo: Repo }) =>
  (body: PostSignupProRequest | PostSignupUserRequest) => {
    if (body.role === ROLES.USER) {
      return signupUser(repo, body)
    }
    if (body.role === ROLES.PRO) {
      return signupPro(repo, body)
    }
    throw new ForbiddenError()
  }
