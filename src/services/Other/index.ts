import { Expo } from 'expo-server-sdk'
import { z } from 'zod'
import { ROLES } from '../../config/constants'
import type { Repo, Role } from '../../types'

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
    await repo.other.deactivateUserOrPro(body)
  }

const makeOther = ({ repo }: { repo: Repo }) => {
  return {
    getServices: getServices({ repo }),
    getSubServiceById: getSubServiceById({ repo }),
    getNotifications: getNotifications({ repo }),
    setPushToken: setPushToken({ repo }),
    healthCheck: healthCheck({ repo }),
    deactivateUserOrPro: deactivateUserOrPro({ repo }),
  }
}

export default makeOther
