import { Repo } from '../../types'
import { hashPassword } from '../../utils'
import { ForbiddenError, NotFoundError } from '../../utils/Error'
import {
  PostChangePasswordReq,
  PostChangePasswordReqSchema,
} from '../../schemas/request/postChangePasswordReq'

export const changePassword =
  ({ repo }: { repo: Repo }) =>
  async (body: PostChangePasswordReq) => {
    PostChangePasswordReqSchema.parse(body)

    const user = await repo.user.getUserById(body.userId)

    if (!user) throw new NotFoundError('user not found')

    const hashedPassword = hashPassword(body.oldPassword)

    if (user.password !== hashedPassword)
      throw new ForbiddenError('wrong password')

    await repo.user.updateUser(body.userId, {
      password: hashPassword(body.newPassword),
    })
  }
