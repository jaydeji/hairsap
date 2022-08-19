import type { Router } from 'express'
import ah from 'express-async-handler'
import { nanoid } from 'nanoid'
import { ROLES, STORAGE_ENDPOINT_CDN } from '../../config/constants'
import { _upload } from '../../config/multer-cloud'
import { allowOnly } from '../../middleware/auth'
import type { Service } from '../../types'
import { patchUser } from './patchUser'

const makeUserRouter = ({
  router,
  service,
}: {
  router: Router
  service: Service
}) => {
  router.patch('/', ah(patchUser({ service })))
  router.post(
    '/faceid',
    _upload({
      getKey: (file, req) =>
        `faceid/pro/${req.tokenData?.userId}/${nanoid()}/${file.originalname}`,
      type: 'image',
    }).single('faceid'),
    ah(async (req, res) => {
      const data = await service.auth.uploadFaceId({
        userId: req.tokenData?.userId,
        role: req.tokenData!.role,
        proId: req.tokenData?.userId,
        faceIdPhotoKey: (req.file as any).key,
        faceIdPhotoOriginalFileName: req.file!.originalname,
      })
      res.status(200).send({ data })
    }),
  )

  router.post(
    '/profilephoto',
    allowOnly([ROLES.USER]),
    _upload({
      getKey: (file, req) =>
        `profilephoto/user/${req.tokenData?.userId}/${nanoid()}/${
          file.originalname
        }`,
      type: 'image',
      acl: 'public-read',
    }).single('profilephoto'),
    ah(async (req, res) => {
      const data = await service.user.uploadProfilePhoto({
        userId: req.tokenData!.userId!,
        profilePhotoKey: (req.file as any).key,
        profilePhotoOriginalFileName: (req.file as any).originalname,
        profilePhotoUrl: STORAGE_ENDPOINT_CDN + (req.file as any).key,
      })
      res.status(200).send({ data })
    }),
  )

  router.post(
    '/subscribe',
    allowOnly([ROLES.USER]),
    ah(async (req, res) => {
      await service.user.subscribe({
        userId: req.tokenData?.userId as number,
        proId: req.body.proId,
      })
      res.sendStatus(201)
    }),
  )
  router.post(
    '/subscriptions',
    allowOnly([ROLES.USER]),
    ah(async (req, res) => {
      const data = await service.user.getUserSubscriptions({
        userId: req.tokenData?.userId as number,
      })
      res.status(200).send({ data })
    }),
  )
  return router
}

export default makeUserRouter
