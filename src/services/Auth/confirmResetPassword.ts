import { Repo } from '../../types'
import { ForbiddenError } from '../../utils/Error'
import {
  PostConfirmResetPasswordReq,
  PostConfirmResetPasswordReqSchema,
} from '../../schemas/request/postConfirmResetPassword'
import { hashPassword, dayjs } from '../../utils'

export const confirmResetPassword =
  ({ repo }: { repo: Repo }) =>
  async (body: PostConfirmResetPasswordReq) => {
    PostConfirmResetPasswordReqSchema.parse(body)

    const passwordTokenData = await repo.auth.getResetPasswordToken(body)

    if (!passwordTokenData) throw new ForbiddenError('token expired')

    if (dayjs(passwordTokenData.expiredAt).isBefore(dayjs()))
      throw new ForbiddenError('token expired')

    const hashedPassword = hashPassword(body.password)

    await repo.user.updateUser(body.userId, {
      password: hashedPassword,
    })
  }
