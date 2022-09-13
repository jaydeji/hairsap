import { PostResetPasswordReq } from '../../schemas/request/postResetPassword'
import { Repo } from '../../types'
import { generateLoginOtp } from '../../utils/otp'
import { dayjs } from '../../utils'
import { resetPasswordTemplate } from '../../config/email/templates/resetPassword'
import { PostConfirmResetPasswordReqSchema } from '../../schemas/request/postConfirmResetPassword'
import { Queue } from '../Queue'

export const resetPassword =
  ({ repo, queue }: { repo: Repo; queue: Queue }) =>
  async (body: PostResetPasswordReq) => {
    PostConfirmResetPasswordReqSchema.parse(body)

    const token = await generateLoginOtp()

    await repo.auth.resetPassword({
      userId: body.userId,
      expiredAt: dayjs().add(1, 'hour').toDate(),
      token,
    })

    queue.emailQueue.add(resetPasswordTemplate({ email: body.email, token }))
  }
