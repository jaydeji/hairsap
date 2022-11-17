import { z } from 'zod'
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
import type { Repo } from '../../types'
import { addCommas, getPageMeta, logger, paginate } from '../../utils'
import { ForbiddenError, NotFoundError } from '../../utils/Error'
import { Queue } from '../Queue'

const acceptReactivation =
  ({ repo }: { repo: Repo }) =>
  async ({ userId }: { userId: number }) => {
    const pro = await repo.user.getUserById(userId)

    if (!pro) throw new NotFoundError('pro not found')

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
        approved: true,
      })
    } else {
      await repo.user.deleteUser(userId)
    }
  }

const getProApplications =
  ({ repo }: { repo: Repo }) =>
  async () => {
    const data = (await repo.pro.getProApplications()).map((e) => ({
      userId: e.userId,
      name: e.name,
      service: e.proServices?.[0].service.name,
      profilePhotoUrl: e.profilePhotoUrl,
    }))
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
  ({ repo, queue }: { repo: Repo; queue: Queue }) =>
  async (proId: number) => {
    z.object({
      proId: z.number(),
    })
      .strict()
      .parse({ proId })

    const { total } = await repo.book.getUnredeemedCashPayments({
      proId,
    })

    queue.notifyQueue.add({
      title: 'Redeem Payout Request',
      body: `Kindly remit payout of ${addCommas(
        total / 100,
      )} within the next 48 hours`,
      userId: proId,
      type: 'general',
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

const getDashboardDiscountedBookingStats =
  ({ repo }: { repo: Repo }) =>
  async () => {
    const data = await repo.admin.getDashboardDiscountedBookingStats()
    return { data }
  }

const getDashboardCompletedBookingStats =
  ({ repo }: { repo: Repo }) =>
  async () => {
    const data = await repo.admin.getDashboardCompletedBookingStats()
    return { data }
  }

const getApplicationVideo =
  ({ repo }: { repo: Repo }) =>
  async (proId: number) => {
    z.object({
      proId: z.number(),
    })
      .strict()
      .parse({ proId })
    const user = await repo.pro.getApplicationVideo(proId)
    return user
  }

const getUnacceptedProPhotos =
  ({ repo }: { repo: Repo }) =>
  () => {
    return repo.admin.getUnacceptedProPhotos()
  }

const deactivatePro =
  ({ repo }: { repo: Repo }) =>
  async (proId: number) => {
    const pro = await repo.pro.getProData({ proId })
    if (!pro) throw new NotFoundError('pro not found')

    return repo.user.updateUser(proId, {
      deactivated: true,
      terminated: pro.deactivationCount >= 4 ? true : undefined,
    })
  }

const acceptUnacceptedProPhotos =
  ({ repo }: { repo: Repo }) =>
  async (proId: number) => {
    const pro = await repo.admin.getUnacceptedProPhoto(proId)

    if (!pro) throw new ForbiddenError('pro not found')

    if (!pro.tempProfilePhotoUrl) {
      logger.info({ pro }, 'unaccepted pro photo')
      throw new ForbiddenError('photo url does not exist')
    }

    await repo.user.updateUser(proId, {
      profilePhotoKey: pro.tempProfilePhotoKey,
      profilePhotoOriginalFileName: pro.tempProfilePhotoOriginalFileName,
      profilePhotoUrl: pro.tempProfilePhotoUrl,
      tempProfilePhotoKey: null,
      tempProfilePhotoOriginalFileName: null,
      tempProfilePhotoUrl: null,
    })
  }

const makeAdmin = ({ repo, queue }: { repo: Repo; queue: Queue }) => {
  return {
    acceptReactivation: acceptReactivation({ repo }),
    getPayoutRequests: getPayoutRequests({ repo }),
    acceptOrRejectApplication: acceptOrRejectApplication({ repo }),
    getProApplications: getProApplications({ repo }),
    confirmPayoutRequest: confirmPayoutRequest({ repo }),
    requestPayout: requestPayout({ repo, queue }),
    getDashboardStats: getDashboardStats({ repo }),
    getDashboardBookingStats: getDashboardBookingStats({ repo }),
    getApplicationVideo: getApplicationVideo({ repo }),
    getUnacceptedProPhotos: getUnacceptedProPhotos({ repo }),
    acceptUnacceptedProPhotos: acceptUnacceptedProPhotos({ repo }),
    getDashboardDiscountedBookingStats: getDashboardDiscountedBookingStats({
      repo,
    }),
    getDashboardCompletedBookingStats: getDashboardCompletedBookingStats({
      repo,
    }),
    deactivatePro: deactivatePro({ repo }),
  }
}

export default makeAdmin
