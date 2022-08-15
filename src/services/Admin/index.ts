import { ROLES } from '../../config/constants'
import { GetPayoutRequestsReqSchema } from '../../schemas/request/getPayoutRequestSchema'
import { PageReq, PageReqSchema } from '../../schemas/request/Page'
import type { Repo, Role } from '../../types'
import { getPageMeta, paginate } from '../../utils'
import { ForbiddenError, NotFoundError } from '../../utils/Error'

const acceptReactivation =
  ({ repo }: { repo: Repo }) =>
  async ({ proId }: { proId: number; role: Role }) => {
    const pro = await repo.user.getUserById(proId)

    if (!pro) throw new NotFoundError('pro not found')

    if (pro.role !== ROLES.PRO) throw new ForbiddenError('user must be pro')

    if (!pro.reactivationRequested)
      throw new ForbiddenError('reactivation not requested')

    if (!pro.deactivated) throw new ForbiddenError('pro already active')

    //TODO: notification

    await repo.user.updateUser(proId, {
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
    const [total, data] = await repo.pro.getPayoutRequestsWP(_page)

    const meta = getPageMeta({
      ..._page,
      total,
    })

    return { meta, data }
  }

const makeAdmin = ({ repo }: { repo: Repo }) => {
  return {
    acceptReactivation: acceptReactivation({ repo }),
    getPayoutRequests: getPayoutRequests({ repo }),
  }
}

export default makeAdmin
