import type { Repo } from '../../types'

const getServices =
  ({ repo }: { repo: Repo }) =>
  () =>
    repo.other.getServices()

const getNotifications =
  ({ repo }: { repo: Repo }) =>
  (userId: number) =>
    repo.other.getNotifications(userId)

const makeOther = ({ repo }: { repo: Repo }) => {
  return {
    getServices: getServices({ repo }),
    getNotifications: getNotifications({ repo }),
  }
}

export default makeOther
