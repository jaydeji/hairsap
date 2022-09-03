import { z } from 'zod'
import { notifyQueue } from '../../config/queue'
import {
  GetAdminDashBookStats,
  GetAdminDashBookStatsSchema,
} from '../../schemas/request/getAdminDashboardBookingStats'
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

const confirmPayoutRequest =
  ({ repo }: { repo: Repo }) =>
  async (invoiceId: number) => {
    z.object({
      invoiceId: z.number(),
    })
      .strict()
      .parse({ invoiceId })
    const invoice = await repo.book.getInvoiceById(invoiceId)
    if (!invoice) throw new NotFoundError('invoice not found')
    if (invoice.paid) throw new ForbiddenError('invoice already marked as paid')
    const data = await repo.book.confirmPayoutRequest(invoiceId)
    return { data }
  }

const requestPayout =
  ({ repo }: { repo: Repo }) =>
  async (proId: number) => {
    z.object({
      proId: z.number(),
    })
      .strict()
      .parse({ proId })

    const { total } = await repo.book.getUnredeemedCashPayments({
      proId,
    })

    notifyQueue.add({
      title: 'Redeem Payout Request',
      body: `Kindly redeem payout of ${total / 100} within the next 48 hours`,
      userId: proId,
    })
  }

const getDashboardStats =
  ({ repo }: { repo: Repo }) =>
  async () => {
    const data = await repo.admin.getDashboardStats()
    return { data }
  }

const getDashboardBookingStats =
  ({ repo }: { repo: Repo }) =>
  async (body: GetAdminDashBookStats) => {
    GetAdminDashBookStatsSchema.parse(body)
    const data = await repo.admin.getDashboardBookingStats(body)
    return { data }
  }

const makeAdmin = ({ repo }: { repo: Repo }) => {
  return {
    acceptReactivation: acceptReactivation({ repo }),
    getPayoutRequests: getPayoutRequests({ repo }),
    acceptOrRejectApplication: acceptOrRejectApplication({ repo }),
    getProApplications: getProApplications({ repo }),
    confirmPayoutRequest: confirmPayoutRequest({ repo }),
    requestPayout: requestPayout({ repo }),
    getDashboardStats: getDashboardStats({ repo }),
    getDashboardBookingStats: getDashboardBookingStats({ repo }),
  }
}

export default makeAdmin
