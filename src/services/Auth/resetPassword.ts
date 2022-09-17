import {
  PostResetPasswordReq,
  PostResetPasswordReqSchema,
} from '../../schemas/request/postResetPassword'
import { Repo } from '../../types'
import { generateLoginOtp } from '../../utils/otp'
import { dayjs } from '../../utils'
import { resetPasswordTemplate } from '../../config/email/templates/resetPassword'
import { Queue } from '../Queue'
import { NotFoundError } from '../../utils/Error'

export const resetPassword =
  ({ repo, queue }: { repo: Repo; queue: Queue }) =>
  async (body: PostResetPasswordReq) => {
    PostResetPasswordReqSchema.parse(body)

    const token = await generateLoginOtp()

    const user = await repo.user.getUserByEmail(body.email)

    if (!user) throw new NotFoundError('user not found')

    await repo.auth.resetPassword({
      userId: user.userId,
      expiredAt: dayjs().add(1, 'hour').toDate(),
      token,
    })

    queue.emailQueue.add(resetPasswordTemplate({ email: body.email, token }))
  }
