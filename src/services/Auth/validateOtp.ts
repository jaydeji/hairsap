import {
  PostValidateOtpReq,
  PostValidateOtpReqSchema,
} from '../../schemas/request/postValidateOtp'
import type { Repo } from '../../types'
import { ForbiddenError } from '../../utils/Error'
import { PostLoginResponseSchema } from '../../schemas/response/postLogin'
import dayjs from '../../utils/dayjs'

export const validateOtp =
  ({ repo }: { repo: Repo }) =>
  async (body: PostValidateOtpReq) => {
    PostValidateOtpReqSchema.parse(body)
    const user = await repo.user.getUserById(body.userId)

    if (!user) throw new ForbiddenError()
    if (!user.otp?.value) throw new ForbiddenError()
    if (user.otp.value !== body.otp) throw new ForbiddenError()

    if (dayjs(user?.otp?.expiredAt).isBefore(dayjs()))
      throw new ForbiddenError()

    await repo.user.updateUser(user.userId, {
      otp: {
        delete: true,
      },
      verified: true,
    })

    return PostLoginResponseSchema.parse(user)
  }
