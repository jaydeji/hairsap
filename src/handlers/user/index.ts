import type { Router } from 'express'
import ah from 'express-async-handler'
import { nanoid } from 'nanoid'
import { ROLES, STORAGE_ENDPOINT_CDN } from '../../config/constants'
import { upload } from '../../config/multer-cloud'
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
  router.patch('/', allowOnly([ROLES.USER]), ah(patchUser({ service })))
  //TODO: fix validation
  router.post(
    '/faceid',
    allowOnly([ROLES.USER, ROLES.PRO]),

    ah(async (req, res) => {
      const result = await upload({
        file: req.files?.['faceid'] as any,
        type: 'image',
        prefix: `faceid/${req.tokenData!.role}/${
          req.tokenData?.userId
        }/${nanoid()}`,
        fieldName: 'faceid',
      })
      await service.auth.uploadFaceId({
        userId: req.tokenData?.userId,
        role: req.tokenData!.role,
        proId: req.tokenData?.userId,
        faceIdPhotoKey: result.key as string,
        faceIdPhotoOriginalFileName: result.originalName as string,
      })
      res.status(201).send()
    }),
  )

  router.post(
    '/profilephoto',
    allowOnly([ROLES.USER]),
    ah(async (req, res) => {
      const result = await upload({
        file: req.files?.['profilephoto'] as any,
        type: 'image',
        prefix: `profilephoto/user/${req.tokenData?.userId}/${nanoid()}`,
        fieldName: 'profilephoto',
        acl: 'public-read',
      })

      const data = await service.user.uploadProfilePhoto({
        userId: req.tokenData!.userId!,
        profilePhotoKey: result.key as string,
        profilePhotoOriginalFileName: result.originalName as string,
        profilePhotoUrl: STORAGE_ENDPOINT_CDN + result.key,
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

  router.get(
    '/me',
    allowOnly([ROLES.USER]),
    ah(async (req, res) => {
      const data = await service.user.getUserData({
        userId: req.tokenData?.userId as number,
      })
      res.status(200).send({ data })
    }),
  )

  router.get(
    '/card',
    allowOnly([ROLES.USER]),
    ah(async (req, res) => {
      const data = await service.user.getCard({
        userId: req.tokenData?.userId as number,
      })
      res.status(200).send({ data })
    }),
  )

  return router
}

export default makeUserRouter
