import {
  PatchUserRequest,
  PatchUserRequestSchema,
} from '../../schemas/request/patchUser'
import type { Repo } from '../../types'

const updateUser =
  ({ repo }: { repo: Repo }) =>
  async (body: PatchUserRequest) => {
    PatchUserRequestSchema.parse(body)
    const { userId, ...newBody } = body
    await repo.user.updateUser(newBody, userId)
  }

const makeUser = ({ repo }: { repo: Repo }) => {
  return {
    updateUser: updateUser({ repo }),
  }
}

export default makeUser
