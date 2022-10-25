import { Expo } from 'expo-server-sdk'
import { z } from 'zod'
import type { Repo } from '../../types'
import { ForbiddenError, NotFoundError } from '../../utils/Error'

const getServices =
  ({ repo }: { repo: Repo }) =>
  () =>
    repo.other.getServices()

const getSubServiceById =
  ({ repo }: { repo: Repo }) =>
  (subServiceId: number) =>
    repo.other.getSubServiceById(subServiceId)

const getNotifications =
  ({ repo }: { repo: Repo }) =>
  (userId: number) =>
    repo.other.getNotifications(userId)

const setPushToken =
  ({ repo }: { repo: Repo }) =>
  (userId: number, pushToken: string) => {
    z.object({
      userId: z.number(),
      pushToken: z.string().refine((token) => Expo.isExpoPushToken(token)),
    }).parse({
      userId,
      pushToken,
    })
    repo.other.setPushToken({ userId, pushToken })
  }

const healthCheck =
  ({ repo }: { repo: Repo }) =>
  async () => {
    await repo.other.dbHealthCheck()
  }

const deactivateUserOrPro =
  ({ repo }: { repo: Repo }) =>
  async (body: { userId: number }) => {
    z.object({ userId: z.number() }).strict().parse(body)
    const user = await repo.other.deactivateUserOrPro(body)
    if (!user) throw new NotFoundError('user not found')
    return user
  }

const addMarketer =
  ({ repo }: { repo: Repo }) =>
  async (body: { name: string }) => {
    z.object({ name: z.string() }).strict().parse(body)
    return await repo.other.addMarketer(body)
  }

const getDiscounts =
  ({ repo }: { repo: Repo }) =>
  async () => {
    return await repo.other.getDiscounts()
  }

const createPromo =
  ({ repo }: { repo: Repo }) =>
  async (body: { marketerId: number; discountId: number; code: string }) => {
    z.object({
      marketerId: z.number(),
      discountId: z.number(),
      code: z.string(),
    })
      .strict()
      .parse(body)

    const promo = await repo.other.getPromoByCode(body.code)
    if (promo) throw new ForbiddenError('promo code already exists')
    return await repo.other.createPromo(body)
  }

const updatePromo =
  ({ repo }: { repo: Repo }) =>
  async (body: { promoId: number; active?: boolean }) => {
    z.object({
      promoId: z.number(),
      active: z.boolean(),
    })
      .strict()
      .parse(body)
    await repo.other.updatePromo(body)
  }

const getAllMarketers =
  ({ repo }: { repo: Repo }) =>
  () => {
    return repo.other.getAllMarketers()
  }

const getMarketerPromos =
  ({ repo }: { repo: Repo }) =>
  (marketerId: number) => {
    z.object({
      marketerId: z.number(),
    })
      .strict()
      .parse({ marketerId })
    return repo.other.getMarketerPromos(marketerId)
  }

const getMarketerStats =
  ({ repo }: { repo: Repo }) =>
  () => {
    return repo.other.getMarketerStats()
  }

const getMarketerStatsById =
  ({ repo }: { repo: Repo }) =>
  (marketerId: number) => {
    z.object({
      marketerId: z.number(),
    })
      .strict()
      .parse({ marketerId })
    return repo.other.getMarketerStatsById(marketerId)
  }

const makeOther = ({ repo }: { repo: Repo }) => {
  return {
    getServices: getServices({ repo }),
    getSubServiceById: getSubServiceById({ repo }),
    getNotifications: getNotifications({ repo }),
    setPushToken: setPushToken({ repo }),
    healthCheck: healthCheck({ repo }),
    deactivateUserOrPro: deactivateUserOrPro({ repo }),
    addMarketer: addMarketer({ repo }),
    getDiscounts: getDiscounts({ repo }),
    createPromo: createPromo({ repo }),
    updatePromo: updatePromo({ repo }),
    getAllMarketers: getAllMarketers({ repo }),
    getMarketerPromos: getMarketerPromos({ repo }),
    getMarketerStats: getMarketerStats({ repo }),
    getMarketerStatsById: getMarketerStatsById({ repo }),
  }
}

export default makeOther
