import { GetPayoutRequestsReqSchema } from '../../schemas/request/getPayoutRequestSchema'
import { PageReq } from '../../schemas/request/Page'
import {
  PostAcceptOrRejectAppReq,
  PostAcceptOrRejectAppReqSchema,
} from '../../schemas/request/postAcceptOrRejectApplication'
import type { Repo, Role } from '../../types'
import { getPageMeta, paginate } from '../../utils'
import { ForbiddenError, NotFoundError } from '../../utils/Error'

const acceptReactivation =
  ({ repo }: { repo: Repo }) =>
  async ({ userId }: { userId: number; role: Role }) => {
    const pro = await repo.user.getUserById(userId)

    if (!pro) throw new NotFoundError('pro not found')

    if (!pro.reactivationRequested)
      throw new ForbiddenError('reactivation not requested')

    if (!pro.deactivated) throw new ForbiddenError('pro already active')

    //TODO: notification

    await repo.user.updateUser(userId, {
      reactivationRequested: false,
      deactivated: false,
      reactivationCount: {
        increment: 1,
      },
    })
  }

const getPayoutRequests =
  ({ repo }: { repo: Repo }) =>
  async (body: PageReq) => {
    GetPayoutRequestsReqSchema.parse(body)

    const _page = paginate(body)
    const data = await repo.pro.getPayoutRequestsWP(_page)

    const meta = getPageMeta({
      ..._page,
      total: data.length,
    })

    return { meta, data }
  }

const acceptOrRejectApplication =
  ({ repo }: { repo: Repo }) =>
  async (body: PostAcceptOrRejectAppReq) => {
    PostAcceptOrRejectAppReqSchema.parse(body)
    const { action, userId } = body
    if (action === 'accept') {
      await repo.user.updateUser(userId, {
        verified: true,
      })
    } else {
      await repo.user.deleteUser(userId)
    }
  }

const getProApplications =
  ({ repo }: { repo: Repo }) =>
  async () => {
    const data = await repo.pro.getProApplications()
    return { data }
  }

const makeAdmin = ({ repo }: { repo: Repo }) => {
  return {
    acceptReactivation: acceptReactivation({ repo }),
    getPayoutRequests: getPayoutRequests({ repo }),
    acceptOrRejectApplication: acceptOrRejectApplication({ repo }),
    getProApplications: getProApplications({ repo }),
  }
}

export default makeAdmin
