import { Repo, Role } from '../../types'
import dayjs from '../../utils/dayjs'
import { ForbiddenError } from '../../utils/Error'
import {
  PostConfirmResetPasswordAdminReqSchema,
  PostConfirmResetPasswordReq,
  PostConfirmResetPasswordReqSchema,
} from '../../schemas/request/postConfirmResetPassword'
import { hashPassword } from '../../utils'

const confirmResetPasswordAdmin = async ({
  repo,
  body,
}: {
  repo: Repo
  body: {
    email: string
    adminId: number
    expiredAt: Date
    token: string
    password: string
    role: Role
  }
}) => {
  PostConfirmResetPasswordAdminReqSchema.parse(body)

  const passwordTokenData = await repo.auth.getResetPasswordToken({
    userId: body.adminId,
    token: body.token,
  })

  if (!passwordTokenData) throw new ForbiddenError('token expired')

  if (dayjs(passwordTokenData.expiredAt).isBefore(dayjs()))
    throw new ForbiddenError('token expired')

  const hashedPassword = hashPassword(body.password)

  await repo.admin.updateAdmin(body.adminId!, {
    password: hashedPassword,
  })
}

const confirmResetPasswordUser = async ({
  repo,
  body,
}: {
  repo: Repo
  body: {
    email: string
    userId?: number
    expiredAt: Date
    token: string
    password: string
    role: Role
  }
}) => {
  PostConfirmResetPasswordReqSchema.parse(body)

  const passwordTokenData = await repo.auth.getResetPasswordToken({
    userId: body.userId,
    token: body.token,
  })

  if (!passwordTokenData) throw new ForbiddenError('token expired')

  if (dayjs(passwordTokenData.expiredAt).isBefore(dayjs()))
    throw new ForbiddenError('token expired')

  const hashedPassword = hashPassword(body.password)

  await repo.user.updateUser(body.userId!, {
    password: hashedPassword,
  })
}

const confirmResetPasswordPro = async ({
  repo,
  body,
}: {
  repo: Repo
  body: {
    email: string
    proId?: number
    expiredAt: Date
    token: string
    password: string
    role: Role
  }
}) => {
  PostConfirmResetPasswordReqSchema.parse(body)

  const passwordTokenData = await repo.auth.getResetPasswordToken({
    userId: body.proId,
    token: body.token,
  })

  if (!passwordTokenData) throw new ForbiddenError('token expired')

  if (dayjs(passwordTokenData.expiredAt).isBefore(dayjs()))
    throw new ForbiddenError('token expired')

  const hashedPassword = hashPassword(body.password)

  await repo.pro.updatePro(body.proId!, {
    password: hashedPassword,
  })
}

export const confirmResetPassword =
  ({ repo }: { repo: Repo }) =>
  ({ userId, adminId, proId, ...body }: PostConfirmResetPasswordReq) => {
    if (adminId) {
      return confirmResetPasswordAdmin({
        repo,
        body: { ...body, adminId },
      })
    }
    if (proId)
      return confirmResetPasswordPro({
        repo,
        body: { ...body, proId },
      })
    if (userId)
      return confirmResetPasswordUser({
        repo,
        body: { ...body, userId },
      })
  }
