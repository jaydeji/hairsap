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
  body: { proId, faceIdPhotoKey, faceIdPhotoOriginalFileName },
}: {
  repo: Repo
  body: {
    proId: number
    faceIdPhotoKey: string
    faceIdPhotoOriginalFileName: string
    role: Role
  }
}) => {
  await copyObject({
    source: '/hairsap/' + faceIdPhotoKey,
    key: `profilephoto/pro/${proId}/${uniqueId()}/${faceIdPhotoOriginalFileName}`,
  })

  await repo.user.updateUser(proId, {
    faceIdPhotoKey,
    faceIdPhotoOriginalFileName,
  })
}

export const uploadFaceId =
  ({ repo }: { repo: Repo }) =>
  async ({
    userId,
    proId,
    role,
    faceIdPhotoKey,
    faceIdPhotoOriginalFileName,
  }: {
    userId?: number
    proId?: number
    role: Role
    faceIdPhotoKey: string
    faceIdPhotoOriginalFileName: string
  }) => {
    if (proId)
      return uploadFaceIdPro({
        repo,
        body: { proId, role, faceIdPhotoKey, faceIdPhotoOriginalFileName },
      })
    if (userId)
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
