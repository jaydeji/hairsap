import { ROLES } from '../../config/constants'
import { signUpEmailTemplate } from '../../config/email/templates/signup'
import { emailQueue } from '../../config/queue'
import {
  PostSignupProRequest,
  PostSignupProRequestSchema,
  PostSignupUserRequest,
  PostSignupUserRequestSchema,
} from '../../schemas/request/postSignup'
import { hashPassword } from '../../utils'

import type { Repo } from '../../types'
import { ForbiddenError, ValidationError } from '../../utils/Error'
import { PostLoginResponseSchema } from '../../schemas/response/postLogin'

import { generateLoginOtp } from '../../utils/otp'
import dayjs from '../../utils/dayjs'

const signupUser = async (repo: Repo, body: PostSignupUserRequest) => {
  //TODO: verify faceId
  PostSignupUserRequestSchema.parse(body)

  const _user = await repo.user.getUserByEmail(body.email)
  if (_user) throw new ValidationError('User with this email already exists')

  const hashedPassword = hashPassword(body.password)

  const { deviceInfo, ...newBody } = body //eslint-disable-line

  const otp = await generateLoginOtp()

  const user = await repo.user.createUser({
    ...newBody,
    password: hashedPassword,
    devices: {
      create: {
        value: body.deviceInfo,
      },
    },
    otp: {
      create: {
        value: otp,
        expiredAt: dayjs().add(10, 'm').toDate(),
      },
    },
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

  return { user: PostLoginResponseSchema.parse(user), otp }
}

const signupPro = async (repo: Repo, body: PostSignupProRequest) => {
  //TODO: verify faceId

  PostSignupProRequestSchema.parse(body)

  const _pro = await repo.user.getUserByEmail(body.email)
  if (_pro) throw new ValidationError('User with this email already exists')

  const hashedPassword = hashPassword(body.password)

  const { deviceInfo, ...newBody } = body //eslint-disable-line

  const otp = await generateLoginOtp()

  const pro = await repo.pro.createPro({
    ...newBody,
    password: hashedPassword,
    devices: {
      create: {
        value: body.deviceInfo,
      },
    },
    otp: {
      create: {
        value: otp,
        expiredAt: dayjs().add(10, 'm').toDate(),
      },
    },
  })

  emailQueue.add(signUpEmailTemplate(pro.name))

  return { pro: PostLoginResponseSchema.parse(pro), otp }
}

export const signUp =
  ({ repo }: { repo: Repo }) =>
  (body: PostSignupProRequest | PostSignupUserRequest) => {
    if (body.role === ROLES.USER) {
      return signupUser(repo, body)
    } else if (body.role === ROLES.PRO) {
      return signupPro(repo, body)
    } else throw new ForbiddenError()
  }
