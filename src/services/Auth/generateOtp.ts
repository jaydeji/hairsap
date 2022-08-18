import { Repo } from '../../types'
import { generateLoginOtp } from '../../utils/otp'
import dayjs from '../../utils/dayjs'
import { OTP_TYPE } from '../../config/constants'
import { emailQueue, phoneQueue } from '../../config/queue'
import { otpEmailTemplate } from '../../config/email/templates/signup'
import { ForbiddenError } from '../../utils/Error'
import {
  PostGenerateOtpReq,
  PostGenerateOtpReqSchema,
} from '../../schemas/request/postGenerateOtp'

export const generateOtp =
  ({ repo }: { repo: Repo }) =>
  async (body: PostGenerateOtpReq) => {
    PostGenerateOtpReqSchema.parse(body)

    const otp = await generateLoginOtp()

    const user = await repo.user.getUserById(body.userId)

    if (!user) throw new ForbiddenError()

    await repo.user.updateUser(body.userId, {
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
    }

    if (body.otpType === OTP_TYPE.EMAIL) {
      emailQueue.add(
        otpEmailTemplate({ name: user.name, email: user.email, otp }),
      )
    }

    throw new ForbiddenError()
  }
