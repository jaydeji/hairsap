import type { Repo, Role } from '../../types'
import { nanoid } from 'nanoid'

const uploadFaceIdUser = async ({
  repo,
  body: { userId, upload },
}: {
  repo: Repo
  body: {
    userId: number
    role: Role
    upload: (getKey: (fileName: string) => string) => Promise<unknown>
  }
}) => {
  let path, fileName
  await upload((_fileName: string) => {
    path = `faceid/user/${userId}/${nanoid()}/${_fileName}`
    fileName = _fileName
    return path
  })
  await repo.user.updateUser(userId, {
    faceIdPhotoPath: path,
    faceIdPhotoOriginalFileName: fileName,
  })
}

const uploadFaceIdPro = async ({
  repo,
  body: { proId, upload },
}: {
  repo: Repo
  body: {
    proId: number
    upload: (getKey: (fileName: string) => string) => Promise<unknown>
    role: Role
  }
}) => {
  let path, fileName
  await upload((_fileName: string) => {
    path = `faceid/user/${proId}/${nanoid()}/${_fileName}`
    fileName = _fileName
    return path
  })
  await repo.user.updateUser(proId, {
    faceIdPhotoPath: path,
    faceIdPhotoOriginalFileName: fileName,
  })
}

export const uploadFaceId =
  ({ repo }: { repo: Repo }) =>
  async ({
    userId,
    proId,
    role,
    upload,
  }: {
    userId?: number
    proId?: number
    upload: (getKey: (fileName: string) => string) => Promise<unknown>
    role: Role
  }) => {
    if (proId) return uploadFaceIdPro({ repo, body: { proId, upload, role } })
    if (userId)
      return uploadFaceIdUser({ repo, body: { userId, upload, role } })
  }
