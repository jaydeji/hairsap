import type { Repo } from '../types'
import makeAuth from './Auth'
import makeChat from './Chat'
import makeUser from './User'

const makeServices = ({ repo }: { repo: Repo }) => {
  return {
    auth: makeAuth({ repo }),
    user: makeUser({ repo }),
    chat: makeChat({ repo }),
  }
}

export default makeServices
