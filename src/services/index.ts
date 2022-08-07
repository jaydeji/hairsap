import type { Repo } from '../types'
import makeAuth from './Auth'

const makeServices = ({ repo }: { repo: Repo }) => {
  return {
    auth: makeAuth({ repo }),
  }
}

export default makeServices
