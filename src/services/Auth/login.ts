import { OTP_TYPE, ROLES } from '../../config/constants'
import { otpEmailTemplate } from '../../config/email/templates/signup'
import { emailQueue, phoneQueue } from '../../config/queue'
import { hashPassword } from '../../utils'
import {
  PostLoginAdminRequest,
  PostLoginAdminRequestSchema,
  PostLoginProRequest,
  PostLoginProRequestSchema,
  PostLoginUserRequest,
  PostLoginUserRequestSchema,
} from '../../schemas/request/postLogin'
import type { Repo } from '../../types'
import { ForbiddenError } from '../../utils/Error'
import { PostLoginResponseSchema } from '../../schemas/response/postLogin'
import { generateLoginOtp } from '../../utils/otp'
import dayjs from '../../utils/dayjs'

const loginAdmin = async ({
  repo,
  body,
  role,
}: {
  repo: Repo
  body: PostLoginAdminRequest
  role: 'admin'
}) => {
  PostLoginAdminRequestSchema.parse({ ...body, role })

  const admin = await repo.admin.getAdminByEmail(body.email)

  if (!admin) throw new ForbiddenError('email or password incorrect')
  const hashedPassword = hashPassword(body.password)

  if (admin.password !== hashedPassword) {
    throw new ForbiddenError('email or password incorrect')
  }

  const otp = await generateLoginOtp()

  await repo.admin.updateAdmin(admin.adminId, {
    otp: {
      create: {
        value: otp,
        expiredAt: dayjs().add(10, 'm').toDate(),
      },
    },
  })

  emailQueue.add(
    otpEmailTemplate({ name: admin.name, email: admin.email, otp }),
  )
  return {
    admin: PostLoginResponseSchema.parse(admin),
    otp,
  }
}

const loginUser = async ({
  repo,
  body,
  role,
}: {
  repo: Repo
  body: PostLoginUserRequest
  role: 'user'
}) => {
  PostLoginUserRequestSchema.parse({ ...body, role })

  const user = await repo.user.getUserByEmail(body.email)

  if (!user) throw new ForbiddenError('email or password incorrect')
  const hashedPassword = hashPassword(body.password)

  if (user.password !== hashedPassword) {
    throw new ForbiddenError('email or password incorrect')
  }

  //TODO: remove device verification
  const device = user.devices.find((device) => device.value === body.deviceInfo)
  if (!device) throw new ForbiddenError('device not recognised')

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

const loginPro = async ({
  repo,
  body,
  role,
}: {
  repo: Repo
  body: PostLoginProRequest
  role: 'pro'
}) => {
  PostLoginProRequestSchema.parse({ ...body, role })

  const pro = await repo.pro.getProByEmail(body.email)

  if (!pro) throw new ForbiddenError('email or password incorrect')
  const hashedPassword = hashPassword(body.password)

  if (pro.password !== hashedPassword) {
    throw new ForbiddenError('email or password incorrect')
  }
  if (pro.deactivated || pro.terminated) {
    throw new ForbiddenError('account inactive, contact support')
  }

  if (!pro.verified) {
    throw new ForbiddenError('account not verified')
  }

  //TODO: remove device verification
  const device = pro.devices.find((device) => device.value === body.deviceInfo)
  if (!device) throw new ForbiddenError('device not recognised')

  const otp = await generateLoginOtp()

  await repo.pro.updatePro(pro.proId, {
    otp: {
      create: {
        value: otp,
        expiredAt: dayjs().add(10, 'm').toDate(),
      },
    },
  })
  if (body.otpType === OTP_TYPE.PHONE) {
    phoneQueue.add({
      phone: pro.phone,
      otp,
    })
  } else if (pro.email && body.otpType === OTP_TYPE.EMAIL) {
    emailQueue.add(otpEmailTemplate({ name: pro.name, email: pro.email, otp }))
  }

  return {
    pro: PostLoginResponseSchema.parse(pro),
    otp,
  }
}

export const login =
  ({ repo }: { repo: Repo }) =>
  (
    body: PostLoginProRequest | PostLoginUserRequest | PostLoginAdminRequest,
  ) => {
    const isAdmin = body.role === ROLES.ADMIN
    const isUser = body.role === ROLES.USER
    const isPro = body.role === ROLES.PRO

    if (isAdmin) {
      return loginAdmin({
        repo,
        body: body as PostLoginAdminRequest,
        role: ROLES.ADMIN,
      })
    } else if (isPro)
      return loginPro({
        repo,
        body: body as PostLoginProRequest,
        role: ROLES.PRO,
      })
    else if (isUser)
      return loginUser({
        repo,
        body: body as PostLoginUserRequest,
        role: ROLES.USER,
      })
    else throw new ForbiddenError()
  }
