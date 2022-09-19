import { Expo } from 'expo-server-sdk'
import { z } from 'zod'
import type { Repo } from '../../types'

const getServices =
  ({ repo }: { repo: Repo }) =>
  () =>
    repo.other.getServices()

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

const makeOther = ({ repo }: { repo: Repo }) => {
  return {
    getServices: getServices({ repo }),
    getNotifications: getNotifications({ repo }),
    setPushToken: setPushToken({ repo }),
    healthCheck: healthCheck({ repo }),
  }
}

export default makeOther
