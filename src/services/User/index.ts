import {
  PatchUserRequest,
  PatchUserRequestSchema,
} from '../../schemas/request/patchUser'
import type { Repo } from '../../types'

const updateUser =
  ({ repo }: { repo: Repo }) =>
  async (userId: number, body: PatchUserRequest) => {
    PatchUserRequestSchema.parse({ ...body, userId: userId })
    await repo.user.updateUser(userId, body)
  }

const makeUser = ({ repo }: { repo: Repo }) => {
  return {
    updateUser: updateUser({ repo }),
  }
}

export default makeUser
