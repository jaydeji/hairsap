import { z } from 'zod'
import {
  PostResetPasswordReq,
  PostResetPasswordReqSchema,
} from '../../schemas/request/postResetPassword'
import { Repo } from '../../types'
import { generateLoginOtp } from '../../utils/otp'
import dayjs from '../../utils/dayjs'
import { emailQueue } from '../../config/queue'
import { resetPasswordTemplate } from '../../config/email/templates/resetPassword'
import { ROLES } from '../../config/constants'
import { ForbiddenError } from '../../utils/Error'
import { RoleSchema } from '../../schemas/models/Role'

const resetPasswordAdmin = async ({
  repo,
  body,
}: {
  repo: Repo
  body: { email: string; adminId?: number; expiredAt: Date }
}) => {
  PostResetPasswordReqSchema.extend({
    userId: z.number(),
  }).parse(body)

  const token = await generateLoginOtp()

  await repo.auth.resetPassword({
    adminId: body.adminId,
    expiredAt: dayjs().add(1, 'hour').toDate(),
    token,
  })

  emailQueue.add(resetPasswordTemplate({ email: body.email, token }))
}

const resetPasswordUser = async ({
  repo,
  body,
}: {
  repo: Repo
  body: { email: string; userId?: number; expiredAt: Date }
}) => {
  PostResetPasswordReqSchema.extend({
    userId: z.number(),
  }).parse(body)

  const token = await generateLoginOtp()

  await repo.auth.resetPassword({
    userId: body.userId,
    expiredAt: dayjs().add(1, 'hour').toDate(),
    token,
  })

  emailQueue.add(resetPasswordTemplate({ email: body.email, token }))
}

const resetPasswordPro = async ({
  repo,
  body,
}: {
  repo: Repo
  body: { email: string; proId?: number; expiredAt: Date }
}) => {
  PostResetPasswordReqSchema.extend({
    proId: z.number(),
  }).parse(body)

  const token = await generateLoginOtp()

  await repo.auth.resetPassword({
    proId: body.proId,
    expiredAt: dayjs().add(1, 'hour').toDate(),
    token,
  })

  emailQueue.add(resetPasswordTemplate({ email: body.email, token }))
}

export const resetPassword =
  ({ repo }: { repo: Repo }) =>
  (body: PostResetPasswordReq) => {
    RoleSchema.parse(body.role)

    const isAdmin = body.role === ROLES.ADMIN
    const isUser = body.role === ROLES.USER
    const isPro = body.role === ROLES.PRO

    if (isAdmin) {
      return resetPasswordAdmin({
        repo,
        body,
      })
    }
    if (isPro)
      return resetPasswordPro({
        repo,
        body,
      })
    if (isUser)
      return resetPasswordUser({
        repo,
        body,
      })
  }
