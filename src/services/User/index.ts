import {
  GetUserSubscriptionsReq,
  GetUserSubscriptionsReqSchema,
} from '../../schemas/request/getUserSubscriptions'
import {
  PatchUserRequest,
  PatchUserRequestSchema,
} from '../../schemas/request/patchUser'
import {
  PostSubscribeReq,
  PostSubscribeReqSchema,
} from '../../schemas/request/postSubscribe'
import type { Repo } from '../../types'

const updateUser =
  ({ repo }: { repo: Repo }) =>
  async (userId: number, body: PatchUserRequest) => {
    PatchUserRequestSchema.parse({ ...body, userId: userId })
    await repo.user.updateUser(userId, body)
  }

const subscribe =
  ({ repo }: { repo: Repo }) =>
  async (body: PostSubscribeReq) => {
    PostSubscribeReqSchema.parse(body)
    return await repo.user.subscribe(body)
  }

const getUserSubscriptions =
  ({ repo }: { repo: Repo }) =>
  async (body: GetUserSubscriptionsReq) => {
    GetUserSubscriptionsReqSchema.parse(body)
    return await repo.user.getUserSubscriptions(body.userId)
  }

const makeUser = ({ repo }: { repo: Repo }) => {
  return {
    updateUser: updateUser({ repo }),
    subscribe: subscribe({ repo }),
    getUserSubscriptions: getUserSubscriptions({ repo }),
  }
}

export default makeUser
