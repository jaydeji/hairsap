import type { Router } from 'express'
import ah from 'express-async-handler'
import { nanoid } from 'nanoid'
import { ROLES, STORAGE_ENDPOINT_CDN } from '../../config/constants'
import { _upload } from '../../config/multer-cloud'
import { allowOnly, denyOnly } from '../../middleware/auth'
import type { Role, Service } from '../../types'

const makeProRouter = ({
  router,
  service,
}: {
  router: Router
  service: Service
}) => {
  router.patch(
    '/',
    allowOnly([ROLES.PRO]),
    ah(async (req, res) => {
      const data = await service.pro.updatePro(req.tokenData!.userId!, req.body)
      res.status(200).send({ data })
    }),
  )

  router.post(
    '/auto',
    ah(async (req, res) => {
      const data = await service.pro.getNearestPro({
        latitude: req.body.latitude,
        longitude: req.body.longitude,
        subServiceId: req.body.subServiceId,
        distance: req.body.distance,
        userId: req.body.userId,
      })
      res.status(200).send({ data })
    }),
  )

  // TODO: REMOve
  router.post(
    '/verify:id',
    allowOnly([ROLES.ADMIN]),
    ah(async (req, res) => {
      await service.pro.verifyPro({
        userId: +req.params.userId as number,
        role: req.tokenData?.role as Role,
      })
      res.status(201).send()
    }),
  )

  router.post(
    '/reactivate/request',
    ah(async (req, res) => {
      await service.pro.requestReactivation({
        userId: req.tokenData?.userId as number,
        role: req.tokenData?.role as Role,
      })
      res.status(201).send()
    }),
  )

  router.get(
    '/subscribers',
    allowOnly([ROLES.PRO]),
    ah(async (req, res) => {
      const data = await service.pro.getProSubscribers({
        proId: req.tokenData?.userId as number,
      })
      res.status(200).send({ data })
    }),
  )

  router.get(
    '/services/:proId',
    ah(async (req, res) => {
      const data = await service.pro.getProServices({
        proId: +req.params.proId as number,
      })
      res.status(200).send({ data })
    }),
  )

  router.get(
    '/me',
    allowOnly([ROLES.PRO]),
    ah(async (req, res) => {
      const data = await service.pro.getProData({
        proId: req.tokenData?.userId as number,
      })
      res.status(200).send({ data })
    }),
  )

  router.post(
    '/search',
    denyOnly([ROLES.PRO]),
    ah(async (req, res) => {
      const data = await service.pro.searchPro({
        name: req.body.name,
      })
      res.status(200).send({ data })
    }),
  )

  router.post(
    '/applicationvideo',
    allowOnly([ROLES.PRO]),
    _upload({
      getKey: (file, req) =>
        `applicationvideo/pro/${req.tokenData?.userId}/${nanoid()}/${
          file.originalname
        }`,
      type: 'video',
    }).single('applicationvideo'),
    ah(async (req, res) => {
      const data = await service.pro.uploadApplicationVideo({
        proId: req.tokenData!.userId!,
        workVideoUrl: STORAGE_ENDPOINT_CDN + (req.file as any).key,
        workVideoKey: (req.file as any).key,
        workVideoOriginalFileName: req.file!.originalname,
      })
      res.status(200).send({ data })
    }),
  )

  router.post(
    '/profilephoto',
    allowOnly([ROLES.PRO]),
    _upload({
      getKey: (file, req) =>
        `profilephoto/pro/${req.tokenData?.userId}/${nanoid()}/${
          file.originalname
        }`,
      type: 'image',
      acl: 'public-read',
    }).single('profilephoto'),
    ah(async (req, res) => {
      const data = await service.pro.uploadProfilePhoto({
        proId: req.tokenData!.userId!,
        tempProfilePhotoKey: (req.file as any).key,
        tempProfilePhotoOriginalFileName: (req.file as any).originalname,
        tempProfilePhotoUrl: STORAGE_ENDPOINT_CDN + (req.file as any).key,
      })
      res.status(200).send({ data })
    }),
  )

  router.get<{ proId?: string }>(
    '/stats/:proId',
    allowOnly([ROLES.PRO]),
    ah(async (req, res) => {
      const data = await service.pro.getProStats({
        proId: +req.params.proId!,
      })
      res.status(200).send({ data })
    }),
  )

  return router
}

export default makeProRouter
