import type Expo from 'expo-server-sdk'
import type { ExpoPushMessage } from 'expo-server-sdk'
import { PostPushNotificationReq } from '../schemas/request/postPushNotification'
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
        await expo.sendPushNotificationsAsync([
          { ...message, to: pushToken, sound: 'default' },
        ])
      } catch (error) {
        logger.err(error, 'Push message error')
      }
    },
    sendMultiPushMessage: async (data: PostPushNotificationReq) => {
      let userTokens

      try {
        if (data.userIds) {
          userTokens = await repo.user.getUserTokens({
            userIds: data.userIds,
          })
        } else {
          userTokens = await repo.user.getUserTokens({
            audience: data.audience!,
          })
        }

        if (!userTokens.length) return

        const chunks = expo.chunkPushNotifications([
          {
            title: data.title,
            body: data.body,
            to: userTokens.map((e) => e.pushToken!),
            sound: 'default',
          },
        ])

        const x = await Promise.allSettled(
          chunks.map((chunk) => expo.sendPushNotificationsAsync(chunk)),
        )

        const error = (
          x.find((e) => e.status === 'rejected') as
            | PromiseRejectedResult
            | undefined
        )?.reason

        if (error) {
          throw new Error(error)
        }
      } catch (error) {
        logger.err(error, 'Error sending multiple push notifications')
        throw error
      }
    },
  }
}

export type Push = ReturnType<typeof makePush>
export default makePush
