import { ROLES } from '../../config/constants'
import {
  PostValidateOtpAdminReq,
  PostValidateOtpAdminReqSchema,
  PostValidateOtpProReq,
  PostValidateOtpProReqSchema,
  PostValidateOtpUserReq,
} from '../../schemas/request/postValidateOtp'
import type { Repo } from '../../types'
import { ForbiddenError } from '../../utils/Error'
import { PostLoginResponseSchema } from '../../schemas/response/postLogin'
import dayjs from '../../utils/dayjs'
import { generateJwt } from '../../utils/jwtLib'

const validateAdmin = async ({
  repo,
  body,
}: {
  repo: Repo
  body: PostValidateOtpAdminReq
}) => {
  PostValidateOtpAdminReqSchema.parse(body)
  const admin = await repo.admin.getAdminById(body.adminId)

  if (!admin) throw new ForbiddenError()
  if (!admin.otp?.value) throw new ForbiddenError()
  if (admin.otp.value !== body.otp) throw new ForbiddenError()

  if (dayjs(admin?.otp?.expiredAt).isBefore(dayjs())) throw new ForbiddenError()
  await repo.admin.updateAdmin(admin.adminId, {
    otp: {
      delete: true,
    },
  })

  const token = generateJwt(
    { email: admin.email, role: body.role, adminId: admin.adminId },
    true,
    {
      expiresIn: String(dayjs.duration({ days: 7 }).as('ms')),
    },
  )

  return { admin: PostLoginResponseSchema.parse(admin), token }
}

const validateUser = async ({
  repo,
  body,
}: {
  repo: Repo
  body: PostValidateOtpUserReq
}) => {
  PostValidateOtpProReqSchema.parse(body)
  const user = await repo.user.getUserById(body.userId)

  if (!user) throw new ForbiddenError()
  if (!user.otp?.value) throw new ForbiddenError()
  if (user.otp.value !== body.otp) throw new ForbiddenError()

  if (dayjs(user?.otp?.expiredAt).isBefore(dayjs())) throw new ForbiddenError()

  await repo.user.updateUser(user.userId, {
    otp: {
      delete: true,
    },
  })

  const token = generateJwt(
    { email: user.email, role: body.role, userId: user.userId },
    false,
    {
      expiresIn: String(dayjs.duration({ days: 7 }).as('ms')),
    },
  )

  return { user: PostLoginResponseSchema.parse(user), token }
}

const validatePro = async ({
  repo,
  body,
}: {
  repo: Repo
  body: PostValidateOtpProReq
}) => {
  PostValidateOtpProReqSchema.parse(body)
  const pro = await repo.pro.getProById(body.proId)

  if (!pro) throw new ForbiddenError()
  if (!pro.otp?.value) throw new ForbiddenError()
  if (pro.otp.value !== body.otp) throw new ForbiddenError()

  if (dayjs(pro?.otp?.expiredAt).isBefore(dayjs())) throw new ForbiddenError()

  await repo.pro.updatePro(pro.proId, {
    otp: {
      delete: true,
    },
  })

  const token = generateJwt(
    { email: pro.email, role: body.role, userId: pro.proId },
    false,
    {
      expiresIn: String(dayjs.duration({ days: 7 }).as('ms')),
    },
  )

  return { pro: PostLoginResponseSchema.parse(pro), token }
}

export const validateOtp =
  ({ repo }: { repo: Repo }) =>
  (
    body:
      | PostValidateOtpAdminReq
      | PostValidateOtpProReq
      | PostValidateOtpUserReq,
  ) => {
    const isAdmin = body.role === ROLES.ADMIN
    const isUser = body.role === ROLES.USER
    const isPro = body.role === ROLES.PRO

    if (isAdmin) {
      return validateAdmin({
        repo,
        body: body as PostValidateOtpAdminReq,
      })
    } else if (isPro)
      return validatePro({
        repo,
        body: body as PostValidateOtpProReq,
      })
    else if (isUser)
      return validateUser({
        repo,
        body: body as PostValidateOtpUserReq,
      })
    else throw new ForbiddenError()
  }
