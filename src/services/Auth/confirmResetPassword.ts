import { Repo } from '../../types'
import dayjs from '../../utils/dayjs'
import { ROLES } from '../../config/constants'
import { ForbiddenError } from '../../utils/Error'
import {
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
    adminId?: number
    expiredAt: Date
    token: string
    password: string
  }
}) => {
  PostConfirmResetPasswordReqSchema.parse(body)

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
  (body: PostConfirmResetPasswordReq) => {
    const isAdmin = body.role === ROLES.ADMIN
    const isUser = body.role === ROLES.USER
    const isPro = body.role === ROLES.PRO

    if (isAdmin) {
      return confirmResetPasswordAdmin({
        repo,
        body,
      })
    } else if (isPro)
      return confirmResetPasswordPro({
        repo,
        body,
      })
    else if (isUser)
      return confirmResetPasswordUser({
        repo,
        body,
      })
    else throw new ForbiddenError()
  }
