import { OTP_TYPE, ROLES } from '../../config/constants'
import {
  otpEmailTemplate,
  signUpEmailTemplate,
} from '../../config/email/templates/signup'
import { emailQueue, phoneQueue } from '../../config/queue'
import {
  PostSignupProRequest,
  PostSignupProRequestSchema,
  PostSignupRequestSchema,
  PostSignupUserRequest,
  PostSignupUserRequestSchema,
} from '../../schemas/request/postSignup'
import { hashPassword, logger } from '../../utils'
import {
  PostLoginProRequest,
  PostLoginProRequestSchema,
  PostLoginRequest,
  PostLoginRequestSchema,
  PostLoginUserRequest,
  PostLoginUserRequestSchema,
} from '../../schemas/request/postLogin'
import type { OtpType, Repo, Role } from '../../types'
import {
  ForbiddenError,
  InternalError,
  ValidationError,
} from '../../utils/Error'
import { generateJwt } from '../../utils/jwtLib'
import { PostLoginResponseSchema } from '../../schemas/response/postLogin'
import {
  PostValidateOtpReq,
  PostValidateOtpReqSchema,
} from '../../schemas/request/postValidateOtp'
import { generateLoginOtp } from '../../utils/otp'
import dayjs from '../../utils/dayjs'
import { upload } from '../../config/multer-cloud'
import { PostResetPasswordReqSchema } from '../../schemas/request/postResetPassword'
import { resetPasswordTemplate } from '../../config/email/templates/resetPassword'
import { PostConfirmResetPasswordReqSchema } from '../../schemas/request/postConfirmResetPassword'

const login = async ({
  repo,
  body,
  role,
}: {
  repo: Repo
  body: PostLoginProRequest | PostLoginUserRequest | PostLoginRequest
  role: Role
}) => {
  if (!role) throw new ValidationError('Param role not passed')

  const isAdmin = role === ROLES.ADMIN

  if (!isAdmin && role === ROLES.USER)
    PostLoginUserRequestSchema.parse({ ...body, role })
  else if (!isAdmin && role === ROLES.PRO)
    PostLoginProRequestSchema.parse({ ...body, role })
  else PostLoginRequestSchema.parse({ ...body, role })

  let user
  try {
    user = await repo.user.getUserByEmail(body.email)
  } catch (error) {
    throw new InternalError(error as string)
  }
  if (!user) throw new ForbiddenError('email or password incorrect')
  const hashedPassword = hashPassword(body.password)

  if (user.password !== hashedPassword) {
    throw new ForbiddenError('email or password incorrect')
  }
  if (!isAdmin && (user.deactivated || user.terminated)) {
    throw new ForbiddenError('account inactive, contact support')
  }

  if (role === ROLES.PRO && !user.verified) {
    throw new ForbiddenError('user not verified')
  }

  //TODO: remove device verification
  if (!isAdmin) {
    const device = user.devices.find(
      (device) =>
        device.value ===
        (body as PostLoginProRequest | PostLoginUserRequest).deviceInfo,
    )
    if (!device) throw new ForbiddenError('device not recognised')
  }

  const otp = await generateLoginOtp()

  await repo.user.updateUser(user.userId, {
    otp: {
      create: {
        value: otp,
        expiredAt: dayjs().add(10, 'm').toDate(),
      },
    },
  })
  if (body.otpType === OTP_TYPE.PHONE) {
    phoneQueue.add({
      phone: user.phone,
      otp,
    })
  } else if (user.email && body.otpType === OTP_TYPE.EMAIL) {
    emailQueue.add(
      otpEmailTemplate({ name: user.name, email: user.email, otp }),
    )
  }

  return {
    user: PostLoginResponseSchema.parse(user),
    otp,
  }
}

const signup = async ({
  repo,
  body,
  role,
}: {
  repo: Repo
  body: PostSignupProRequest | PostSignupUserRequest
  role: Role
}) => {
  //TODO: verify faceId
  if (!role) throw new ValidationError('Param role not passed')

  if (role === ROLES.USER) {
    PostSignupUserRequestSchema.parse({ ...body, role })
  } else if (role === ROLES.PRO) {
    PostSignupProRequestSchema.parse({ ...body, role })
  } else {
    PostSignupRequestSchema.parse({ ...body, role })
  }

  const _user = await repo.user.getUserByEmailandRole(body.email, role)
  if (_user) throw new ValidationError('User with this email already exists')

  const hashedPassword = hashPassword(body.password)

  const { deviceInfo, ...newBody } = body //eslint-disable-line

  const otp = await generateLoginOtp()

  const user = await repo.user.createUser({
    ...newBody,
    role: role,
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

const validateOtp =
  ({ repo }: { repo: Repo }) =>
  async (body: PostValidateOtpReq) => {
    PostValidateOtpReqSchema.parse(body)

    const user = await repo.user.getUserByIdAndOtp(body.userId)

    if (!user) throw new ForbiddenError()

    if (!user.otp?.value) throw new ForbiddenError()
    if (user.otp.value !== body.otp) throw new ForbiddenError()

    if (dayjs(user?.otp?.expiredAt).isBefore(dayjs()))
      throw new ForbiddenError()

    await repo.user.updateUser(user.userId, {
      otp: {
        delete: true,
      },
    })

    const token = generateJwt(
      { email: user.email, role: user.role, userId: user.userId },
      false,
      {
        expiresIn: String(dayjs.duration({ days: 7 }).as('ms')),
      },
    )

    return { user: PostLoginResponseSchema.parse(user), token }
  }

const uploadFaceId =
  ({ repo }: { repo: Repo }) =>
  async (userId: number, path?: string) => {
    logger.info(path)
    // TODO: create unique photo name
    if (!path) throw new InternalError()
    await repo.user.updateUser(userId, {
      livePhotoUrl: path,
    })

    return { path }
  }

const resetPassword =
  ({ repo }: { repo: Repo }) =>
  async (body: { email: string; userId: number; expiredAt: Date }) => {
    PostResetPasswordReqSchema.parse(body)

    const token = await generateLoginOtp()

    await repo.user.resetPassword(
      body.userId,
      dayjs().add(1, 'hour').toDate(),
      token,
    )

    emailQueue.add(resetPasswordTemplate({ email: body.email, token }))
  }

const confirmResetPassword =
  ({ repo }: { repo: Repo }) =>
  async (body: { userId: number; token: string; password: string }) => {
    PostConfirmResetPasswordReqSchema.parse(body)

    const passwordTokenData = await repo.user.getResetPasswordToken(
      body.userId,
      body.token,
    )

    if (!passwordTokenData) throw new ForbiddenError('token expired')

    if (dayjs(passwordTokenData.expiredAt).isBefore(dayjs()))
      throw new ForbiddenError('token expired')

    const hashedPassword = hashPassword(body.password)

    await repo.user.updateUser(body.userId, {
      password: hashedPassword,
    })
  }

const makeAuth = ({ repo }: { repo: Repo }) => {
  return {
    login: (body: PostLoginRequest, role: Role) => login({ repo, body, role }),
    signup: (body: PostSignupProRequest | PostSignupUserRequest, role: Role) =>
      signup({ repo, body, role }),
    validateOtp: validateOtp({ repo }),
    uploadFaceId: uploadFaceId({ repo }),
    confirmResetPassword: confirmResetPassword({ repo }),
    resetPassword: resetPassword({ repo }),
  }
}

export default makeAuth
