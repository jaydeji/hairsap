import type { Repo } from '../types'
import type Expo from 'expo-server-sdk'

import makeAuth from './Auth'
import makeChat from './Chat'
import makeUser from './User'
import makePro from './Pro'
import makeBook from './Book'
import makeAdmin from './Admin'
import makeOther from './Other'
import makePush from './Push'
import makeQueue from './Queue'

const makeServices = ({ repo, expo }: { repo: Repo; expo: Expo }) => {
  const queue = makeQueue({ repo })

  return {
    auth: makeAuth({ repo, queue }),
    user: makeUser({ repo, queue }),
    chat: makeChat({ repo }),
    pro: makePro({ repo }),
    book: makeBook({ repo, queue }),
    admin: makeAdmin({ repo, queue }),
    other: makeOther({ repo }),
    push: makePush({ expo }),
    queue,
  }
}

export default makeServices
