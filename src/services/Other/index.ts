import { Entity } from '../../schemas/models/Entity'
import type { Repo } from '../../types'

const getServices =
  ({ repo }: { repo: Repo }) =>
  () =>
    repo.other.getServices()

const getNotifications =
  ({ repo }: { repo: Repo }) =>
  (body: Entity) =>
    repo.other.getNotifications(body)

const makeOther = ({ repo }: { repo: Repo }) => {
  return {
    getServices: getServices({ repo }),
    getNotifications: getNotifications({ repo }),
  }
}

export default makeOther
