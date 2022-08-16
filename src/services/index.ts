import type { Repo } from '../types'
import makeAuth from './Auth'
import makeChat from './Chat'
import makeUser from './User'
import makePro from './Pro'
import makeBook from './Book'
import makeAdmin from './Admin'
import makeOther from './Other'

const makeServices = ({ repo }: { repo: Repo }) => {
  return {
    auth: makeAuth({ repo }),
    user: makeUser({ repo }),
    chat: makeChat({ repo }),
    pro: makePro({ repo }),
    book: makeBook({ repo }),
    admin: makeAdmin({ repo }),
    other: makeOther({ repo }),
  }
}

export default makeServices
