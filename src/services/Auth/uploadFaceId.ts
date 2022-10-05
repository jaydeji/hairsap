import { z } from 'zod'
import { ROLES, STORAGE_ENDPOINT_CDN } from '../../config/constants'
import { copyObject } from '../../config/multer-cloud'
import type { Repo, Role } from '../../types'
import { uniqueId } from '../../utils'

const uploadFaceIdUser = async ({
  repo,
  body: { userId, faceIdPhotoKey, faceIdPhotoOriginalFileName },
}: {
  repo: Repo
  body: {
    userId: number
    faceIdPhotoKey: string
    faceIdPhotoOriginalFileName: string
    role: Role
  }
}) => {
  await repo.user.updateUser(userId, {
    faceIdPhotoKey,
    faceIdPhotoOriginalFileName,
  })
}

const uploadFaceIdPro = async ({
  repo,
  body: { userId, faceIdPhotoKey, faceIdPhotoOriginalFileName },
}: {
  repo: Repo
  body: {
    userId: number
    faceIdPhotoKey: string
    faceIdPhotoOriginalFileName: string
    role: Role
  }
}) => {
  const key = `profilephoto/pro/${userId}/${uniqueId()}_${faceIdPhotoOriginalFileName}`
  await copyObject({
    source: '/hairsap/' + faceIdPhotoKey,
    key,
  })

  await repo.user.updateUser(userId, {
    faceIdPhotoKey,
    faceIdPhotoOriginalFileName,
    profilePhotoKey: key,
    profilePhotoOriginalFileName: faceIdPhotoOriginalFileName,
    profilePhotoUrl: STORAGE_ENDPOINT_CDN + key,
  })
}

export const uploadFaceId =
  ({ repo }: { repo: Repo }) =>
  async ({
    userId,
    role,
    faceIdPhotoKey,
    faceIdPhotoOriginalFileName,
  }: {
    userId: number
    role: Role
    faceIdPhotoKey: string
    faceIdPhotoOriginalFileName: string
  }) => {
    z.object({ userId: z.number() }).strict().parse({ userId })
    if (role === ROLES.PRO)
      return uploadFaceIdPro({
        repo,
        body: {
          userId,
          role,
          faceIdPhotoKey,
          faceIdPhotoOriginalFileName,
        },
      })
    else
      return uploadFaceIdUser({
        repo,
        body: {
          userId,
          role,
          faceIdPhotoKey,
          faceIdPhotoOriginalFileName,
        },
      })
  }
