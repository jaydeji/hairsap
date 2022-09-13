import { Repo } from '../../types'
import { generateLoginOtp } from '../../utils/otp'
import { dayjs } from '../../utils'
import { OTP_TYPE } from '../../config/constants'
import { otpEmailTemplate } from '../../config/email/templates/signup'
import { ForbiddenError } from '../../utils/Error'
import {
  PostGenerateOtpReq,
  PostGenerateOtpReqSchema,
} from '../../schemas/request/postGenerateOtp'
import { Queue } from '../Queue'

export const generateOtp =
  ({ repo, queue }: { repo: Repo; queue: Queue }) =>
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
      queue.phoneQueue.add({
        phone: user.phone,
        body: `Please use the OTP: ${otp} to complete your signup - Hairsap`,
      })
    }

    if (body.otpType === OTP_TYPE.EMAIL) {
      queue.emailQueue.add(
        otpEmailTemplate({ name: user.name, email: user.email, otp }),
      )
    }

    throw new ForbiddenError()
  }
