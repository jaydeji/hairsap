import type Expo from 'expo-server-sdk'
import type { ExpoPushMessage } from 'expo-server-sdk'
import type { Repo } from '../types'

import { logger } from '../utils'

const makePush = ({ expo, repo }: { expo: Expo; repo: Repo }) => {
  return {
    sendPushMessage: async (
      userId: number,
      message: Omit<ExpoPushMessage, 'to'>,
    ) => {
      try {
        const pushToken = (await repo.other.getPushToken({ userId }))?.pushToken
        if (!pushToken) return
        await expo.sendPushNotificationsAsync([{ ...message, to: pushToken }])
      } catch (error) {
        logger.err(error)
      }
    },
  }
}

export type Push = ReturnType<typeof makePush>
export default makePush
