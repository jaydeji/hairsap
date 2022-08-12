import { PRO_STATUS } from '../../config/constants'
import { PostGetProReqSchema } from '../../schemas/request/postGetPro'
import type { Repo } from '../../types'
import { getTransportPrice } from '../../utils'

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
      status: PRO_STATUS.AVAILABLE,
      total: price + transportation,
    }
  }

const makePro = ({ repo }: { repo: Repo }) => {
  return {
    getNearestPro: getNearestPro({ repo }),
  }
}

export default makePro
