import { z } from 'zod'
import { ROLES, STORAGE_ENDPOINT_CDN } from '../../config/constants'
import { copyObject } from '../../config/multer-cloud'
import type { Repo, Role } from '../../types'
import { uniqueId } from '../../utils'

const uploadFaceIdUser = async ({
  repo,
  body: { userId, faceIdPhotoKey, faceIdPhotoUrl, faceIdPhotoOriginalFileName },
}: {
  repo: Repo
  body: {
    userId: number
    faceIdPhotoKey: string
    faceIdPhotoUrl: string
    faceIdPhotoOriginalFileName: string
    role: Role
  }
}) => {
  await repo.user.updateUser(userId, {
    faceIdPhotoKey,
    faceIdPhotoOriginalFileName,
    faceIdPhotoUrl,
  })
}

const uploadFaceIdPro = async ({
  repo,
  body: { userId, faceIdPhotoKey, faceIdPhotoOriginalFileName, faceIdPhotoUrl },
}: {
  repo: Repo
  body: {
    userId: number
    faceIdPhotoKey: string
    faceIdPhotoOriginalFileName: string
    faceIdPhotoUrl: string
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
    faceIdPhotoUrl,
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
    faceIdPhotoUrl,
  }: {
    userId: number
    role: Role
    faceIdPhotoKey: string
    faceIdPhotoOriginalFileName: string
    faceIdPhotoUrl: string
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
          faceIdPhotoUrl,
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
          faceIdPhotoUrl,
        },
      })
  }
