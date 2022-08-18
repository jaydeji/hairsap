import { PostResetPasswordReq } from '../../schemas/request/postResetPassword'
import { Repo } from '../../types'
import { generateLoginOtp } from '../../utils/otp'
import dayjs from '../../utils/dayjs'
import { emailQueue } from '../../config/queue'
import { resetPasswordTemplate } from '../../config/email/templates/resetPassword'
import { PostConfirmResetPasswordReqSchema } from '../../schemas/request/postConfirmResetPassword'

export const resetPassword =
  ({ repo }: { repo: Repo }) =>
  async (body: PostResetPasswordReq) => {
    PostConfirmResetPasswordReqSchema.parse(body)

    const token = await generateLoginOtp()

    await repo.auth.resetPassword({
      userId: body.userId,
      expiredAt: dayjs().add(1, 'hour').toDate(),
      token,
    })

    emailQueue.add(resetPasswordTemplate({ email: body.email, token }))
  }
