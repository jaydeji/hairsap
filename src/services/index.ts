import type { Repo } from '../types'
import makeAuth from './Auth'
import makeChat from './Chat'
import makeUser from './User'
import makePro from './Pro'
import makeBook from './Book'

const makeServices = ({ repo }: { repo: Repo }) => {
  return {
    auth: makeAuth({ repo }),
    user: makeUser({ repo }),
    chat: makeChat({ repo }),
    pro: makePro({ repo }),
    book: makeBook({ repo }),
  }
}

export default makeServices
