import { GetPayoutRequestsReqSchema } from '../../schemas/request/getPayoutRequestSchema'
import { PageReq } from '../../schemas/request/Page'
import { PostAcceptBookingReqSchema } from '../../schemas/request/postAcceptBooking'
import { PostAcceptOrRejectAppReq } from '../../schemas/request/postAcceptOrRejectApplication'
import type { Repo, Role } from '../../types'
import { getPageMeta, paginate } from '../../utils'
import { ForbiddenError, NotFoundError } from '../../utils/Error'

const acceptReactivation =
  ({ repo }: { repo: Repo }) =>
  async ({ proId }: { proId: number; role: Role }) => {
    const pro = await repo.pro.getProById(proId)

    if (!pro) throw new NotFoundError('pro not found')

    if (!pro.reactivationRequested)
      throw new ForbiddenError('reactivation not requested')

    if (!pro.deactivated) throw new ForbiddenError('pro already active')

    //TODO: notification

    await repo.pro.updatePro(proId, {
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

const acceptOrRejectApplication =
  ({ repo }: { repo: Repo }) =>
  async (body: PostAcceptOrRejectAppReq) => {
    PostAcceptBookingReqSchema.parse(body)
    const { action, proId } = body
    if (action === 'accept') {
      await repo.pro.updatePro(proId, {
        verified: true,
      })
    } else {
      await repo.pro.updatePro(proId, {
        rejected: true,
      })
    }
  }

const makeAdmin = ({ repo }: { repo: Repo }) => {
  return {
    acceptReactivation: acceptReactivation({ repo }),
    getPayoutRequests: getPayoutRequests({ repo }),
    acceptOrRejectApplication: acceptOrRejectApplication({ repo }),
  }
}

export default makeAdmin
