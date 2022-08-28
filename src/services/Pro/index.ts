import { z } from 'zod'
import { ROLES } from '../../config/constants'
import {
  GetAllProsReq,
  GetAllProsReqSchema,
} from '../../schemas/request/getAllPros'
import { PageReq } from '../../schemas/request/Page'
import {
  PatchProRequestSchema,
  PatchProRequest,
} from '../../schemas/request/patchPro'
import {
  PostApplicationVideoReq,
  PostApplicationVideoReqSchema,
} from '../../schemas/request/postGetApplicationVideo'
import { PostGetProReqSchema } from '../../schemas/request/postGetPro'
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
    await repo.user.updateUser(userId, body)
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
    const pro = await repo.pro.getNearestPro(data)
    if (!pro) return
    //TODO: get status
    //TODO: get reviews count

    const transportation = getTransportPrice(pro.distance!)
    const arrivalAt = getArrivalTime(pro.distance!)
    const price = pro.price!

    delete pro.distance
    delete pro.price

    return {
      pro,
      transportation,
      total: price + transportation,
      arrivalAt,
    }
  }

const verifyPro =
  ({ repo }: { repo: Repo }) =>
  async ({ userId, role }: { userId: number; role: Role }) => {
    if (role !== ROLES.ADMIN) throw new ForbiddenError()

    const pro = await repo.user.getUserById(userId)

    if (!pro) throw new NotFoundError('pro not found')

    if (pro.verified) throw new ForbiddenError('pro is already verified')

    await repo.user.updateUser(userId, {
      verified: true,
    })
  }

const requestReactivation =
  ({ repo }: { repo: Repo }) =>
  async ({ userId, role }: { userId: number; role: Role }) => {
    if (role !== ROLES.PRO) throw new ForbiddenError()

    const pro = await repo.user.getUserById(userId)

    if (!pro) throw new NotFoundError('pro not found')

    if (pro.reactivationRequested)
      throw new ForbiddenError('reactivation already requested')

    //TODO: notification
    await repo.user.updateUser(userId, {
      reactivationRequested: true,
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

const makePro = ({ repo }: { repo: Repo }) => {
  return {
    getNearestPro: getNearestPro({ repo }),
    verifyPro: verifyPro({ repo }),
    requestReactivation: requestReactivation({ repo }),
    getProSubscribers: getProSubscribers({ repo }),
    getProServices: getProServices({ repo }),
    getAllPros: getAllPros({ repo }),
    getProDetails: getProDetails({ repo }),
    updatePro: updatePro({ repo }),
    getProData: getProData({ repo }),
    searchPro: searchPro({ repo }),
    uploadApplicationVideo: uploadApplicationVideo({ repo }),
  }
}

export default makePro
