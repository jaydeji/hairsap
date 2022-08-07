import type { Repo } from '../types'
import makeAuth from './Auth'
import makeUser from './User'

const makeServices = ({ repo }: { repo: Repo }) => {
  return {
    auth: makeAuth({ repo }),
    user: makeUser({ repo }),
  }
}

export default makeServices
