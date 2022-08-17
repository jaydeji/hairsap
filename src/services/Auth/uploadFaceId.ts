import { logger } from '../../utils'
import type { Repo, Role } from '../../types'
import { ROLES } from '../../config/constants'
import { ForbiddenError, InternalError } from '../../utils/Error'

const uploadFaceIdUser = async ({
  repo,
  body: { path, userId },
}: {
  repo: Repo
  body: { userId?: number; path?: string }
}) => {
  // TODO: create unique photo name
  if (!path) throw new InternalError()
  logger.info(path)
  await repo.user.updateUser(userId!, {
    livePhotoUrl: path,
  })

  return { path }
}

const uploadFaceIdPro = async ({
  repo,
  body: { path, proId },
}: {
  repo: Repo
  body: { proId?: number; path?: string }
}) => {
  // TODO: create unique photo name
  if (!path) throw new InternalError()
  logger.info(path)
  await repo.pro.updatePro(proId!, {
    livePhotoUrl: path,
  })

  return { path }
}

export const uploadFaceId =
  ({ repo }: { repo: Repo }) =>
  async ({
    userId,
    proId,
    path,
    role,
  }: {
    userId?: number
    proId?: number
    path?: string
    role: Role
  }) => {
    if (role === ROLES.PRO)
      return uploadFaceIdPro({ repo, body: { proId, path } })
    if (role === ROLES.USER)
      return uploadFaceIdUser({ repo, body: { userId, path } })
    throw new ForbiddenError()
  }
