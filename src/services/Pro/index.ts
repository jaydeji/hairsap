import { z } from 'zod'
import { ROLES } from '../../config/constants'
import {
  GetAllProsReq,
  GetAllProsReqSchema,
} from '../../schemas/request/getAllPros'
import { PageReq } from '../../schemas/request/Page'
import { PostGetProReqSchema } from '../../schemas/request/postGetPro'
import type { Repo, Role } from '../../types'
import { getPageMeta, getTransportPrice, paginate } from '../../utils'
import { ForbiddenError, NotFoundError } from '../../utils/Error'

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
    const price = pro.price!

    delete pro.distance
    delete pro.price

    return {
      pro,
      transportation,
      total: price + transportation,
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

const makePro = ({ repo }: { repo: Repo }) => {
  return {
    getNearestPro: getNearestPro({ repo }),
    verifyPro: verifyPro({ repo }),
    requestReactivation: requestReactivation({ repo }),
    getProSubscribers: getProSubscribers({ repo }),
    getProServices: getProServices({ repo }),
    getAllPros: getAllPros({ repo }),
  }
}

export default makePro
