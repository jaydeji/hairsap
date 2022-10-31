import { z } from 'zod'
import { ADMIN_ID, ROLES } from '../../config/constants'
import {
  GetAllProsReq,
  GetAllProsReqSchema,
} from '../../schemas/request/getAllPros'
import {
  GetProBookingRatioReq,
  GetProBookingRatioReqSchema,
} from '../../schemas/request/getProBookingRatio'
import {
  GetProReviewsReq,
  GetProReviewsReqSchema,
} from '../../schemas/request/getProReviews'
import { PageReq } from '../../schemas/request/Page'
import {
  PatchProRequestSchema,
  PatchProRequest,
} from '../../schemas/request/patchPro'
import {
  PostApplicationVideoReq,
  PostApplicationVideoReqSchema,
} from '../../schemas/request/postGetApplicationVideo'
import { PostGetManualProReqSchema } from '../../schemas/request/postGetManualPro'
import { PostGetProReqSchema } from '../../schemas/request/postGetPro'
import {
  PostUploadProProfilePhotoReq,
  PostUploadProProfilePhotoReqSchema,
} from '../../schemas/request/postUploadProfilePhoto'
import type { Repo, Role } from '../../types'
import {
  getArrivalTime,
  getPageMeta,
  getTransportPrice,
  paginate,
} from '../../utils'
import { ForbiddenError, NotFoundError } from '../../utils/Error'

const updatePro =
  ({ repo }: { repo: Repo }) =>
  async (userId: number, body: PatchProRequest) => {
    PatchProRequestSchema.parse({ ...body, userId: userId })

    if (body.phone) {
      const proWithPhone = await repo.user.getUserByPhone(body.phone)
      if (proWithPhone && proWithPhone.userId !== userId)
        throw new ForbiddenError('pro with phone number already exists')
    }

    await repo.user.updateUser(userId, {
      address: body.address,
      available: body.available,
      bio: body.bio,
      phone: body.phone,
      latitude: body.latitude,
      longitude: body.longitude,
      account: body.account
        ? {
            upsert: {
              create: body.account,
              update: body.account,
            },
          }
        : undefined,
    })

    if (typeof body.available === 'boolean') {
      await repo.pro.updateAvailability(userId, body.available)
    }
  }

const getNearestPro =
  ({ repo }: { repo: Repo }) =>
  async (data: {
    longitude: number
    latitude: number
    subServiceId: number
    distance?: number
    userId?: number
  }) => {
    PostGetProReqSchema.parse(data)

    const subService = await repo.other.getSubServiceById(data.subServiceId)
    if (!subService) throw new NotFoundError('subService not found')

    const pro = await repo.pro.getNearestPro(data)
    if (!pro) return {}
    //TODO: get status
    //TODO: get reviews count

    const transportation = getTransportPrice(pro.distance!)
    const arrivalAt = getArrivalTime(pro.distance!)
    const price = pro.price!

    // @ts-ignore
    delete pro.price

    return {
      pro,
      transportation,
      total: price + transportation,
      arrivalAt,
    }
  }

const getManualPro =
  ({ repo }: { repo: Repo }) =>
  async (data: {
    longitude: number
    latitude: number
    subServiceId: number
    userId: number
  }) => {
    PostGetManualProReqSchema.parse(data)

    const subService = await repo.other.getSubServiceById(data.subServiceId)
    if (!subService) throw new NotFoundError('subService not found')

    const pro = await repo.pro.getManualPro(data)
    if (!pro) return {}

    const transportation = getTransportPrice(pro.distance!)
    const arrivalAt = getArrivalTime(pro.distance!)
    const price = pro.price!

    delete pro.price

    return {
      pro,
      transportation,
      total: price + transportation,
      arrivalAt,
    }
  }

const requestReactivation =
  ({ repo }: { repo: Repo }) =>
  async ({ userId, role }: { userId: number; role: Role }) => {
    if (role !== ROLES.PRO) throw new ForbiddenError()

    const pro = await repo.user.getUserById(userId)

    if (!pro) throw new NotFoundError('pro not found')

    if (pro.reactivationRequested)
      throw new ForbiddenError('reactivation already requested')

    await repo.user.updateUser(userId, {
      reactivationRequested: true,
    })

    await repo.other.createNotification({
      body: 'Reactivation request',
      title: `Reactivation request from ${pro.name} with id: ${pro.userId}`,
      userId: ADMIN_ID,
    })
  }

const getProSubscribers =
  ({ repo }: { repo: Repo }) =>
  async ({ proId }: { proId: number }) => {
    z.object({ proId: z.number() }).parse({ proId })
    return await repo.pro.getProSubscribers(proId)
  }

const getProServices =
  ({ repo }: { repo: Repo }) =>
  async ({ proId }: { proId: number }) => {
    z.object({ proId: z.number() }).parse({ proId })
    return await repo.pro.getProServices(proId)
  }

const getAllPros =
  ({ repo }: { repo: Repo }) =>
  async (body: GetAllProsReq & PageReq) => {
    GetAllProsReqSchema.parse(body)

    const { perPage, page } = body

    const _page = paginate({ perPage, page })

    const [total, data] = await repo.pro.getAllPros({
      ...body,
      skip: _page.skip,
    })
    const meta = getPageMeta({
      ..._page,
      total,
    })

    return { meta, data }
  }

const getProDetails =
  ({ repo }: { repo: Repo }) =>
  async (body: { userId: number }) => {
    z.object({ userId: z.number() }).strict().parse(body)

    const data = await repo.pro.getProDetails({ proId: body.userId })

    return data
  }

const getProInfo =
  ({ repo }: { repo: Repo }) =>
  async (body: { proId: number; userId: number }) => {
    z.object({ proId: z.number(), userId: z.number() }).strict().parse(body)

    const data = await repo.pro.getProInfo(body.proId, body.userId)

    if (!data) throw new NotFoundError('pro not found')

    return data
  }

const getProData =
  ({ repo }: { repo: Repo }) =>
  async (body: { proId: number }) => {
    z.object({ proId: z.number() }).strict().parse(body)

    const data = await repo.pro.getProData(body)

    return data
  }

const searchPro =
  ({ repo }: { repo: Repo }) =>
  async (body: { name: string }) => {
    z.object({ name: z.string() }).strict().parse(body)

    const data = await repo.pro.searchPro(body)

    return data
  }

const uploadApplicationVideo =
  ({ repo }: { repo: Repo }) =>
  async (body: PostApplicationVideoReq) => {
    PostApplicationVideoReqSchema.parse(body)
    const { proId, workVideoUrl, workVideoKey, workVideoOriginalFileName } =
      body

    await repo.user.updateUser(proId, {
      workVideoUrl,
      workVideoKey,
      workVideoOriginalFileName,
    })
  }

const uploadProfilePhoto =
  ({ repo }: { repo: Repo }) =>
  async (body: PostUploadProProfilePhotoReq) => {
    PostUploadProProfilePhotoReqSchema.parse(body)

    const {
      proId,
      tempProfilePhotoKey,
      tempProfilePhotoOriginalFileName,
      tempProfilePhotoUrl,
    } = body

    await repo.user.updateUser(proId, {
      tempProfilePhotoKey,
      tempProfilePhotoOriginalFileName,
      tempProfilePhotoUrl,
    })
  }

const getProStats =
  ({ repo }: { repo: Repo }) =>
  async (body: { proId: number }) => {
    z.object({ proId: z.number() }).parse(body)
    return await repo.pro.getProStats(body)
  }

const getProBookingRatio =
  ({ repo }: { repo: Repo }) =>
  async (body: GetProBookingRatioReq) => {
    GetProBookingRatioReqSchema.parse(body)
    return await repo.pro.getProBookingRatio(body)
  }

const getProReviews =
  ({ repo }: { repo: Repo }) =>
  async (body: GetProReviewsReq) => {
    GetProReviewsReqSchema.parse(body)
    return await repo.pro.getProReviews(body)
  }

const getAdminProStats =
  ({ repo }: { repo: Repo }) =>
  async () => {
    return await repo.pro.getAdminProStats()
  }

const makePro = ({ repo }: { repo: Repo }) => {
  return {
    getNearestPro: getNearestPro({ repo }),
    getManualPro: getManualPro({ repo }),
    requestReactivation: requestReactivation({ repo }),
    getProSubscribers: getProSubscribers({ repo }),
    getProServices: getProServices({ repo }),
    getAllPros: getAllPros({ repo }),
    getProDetails: getProDetails({ repo }),
    updatePro: updatePro({ repo }),
    getProData: getProData({ repo }),
    searchPro: searchPro({ repo }),
    uploadApplicationVideo: uploadApplicationVideo({ repo }),
    uploadProfilePhoto: uploadProfilePhoto({ repo }),
    getProStats: getProStats({ repo }),
    getProBookingRatio: getProBookingRatio({ repo }),
    getProInfo: getProInfo({ repo }),
    getProReviews: getProReviews({ repo }),
    getAdminProStats: getAdminProStats({ repo }),
  }
}

export default makePro
