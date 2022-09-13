import type Expo from 'expo-server-sdk'

const makePush = ({ expo }: { expo: Expo }) => {
  return {
    sendPushMessage: async () => {
      expo.sendPushNotificationsAsync
    },
  }
}

export default makePush
