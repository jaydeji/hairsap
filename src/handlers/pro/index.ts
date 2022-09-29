import type { Router } from 'express'
import ah from 'express-async-handler'
import { nanoid } from 'nanoid'
import { ROLES, STORAGE_ENDPOINT_CDN } from '../../config/constants'
import { upload } from '../../config/multer-cloud'
import { allowOnly, denyOnly } from '../../middleware/auth'
import { GetProBookingRatioReq } from '../../schemas/request/getProBookingRatio'
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
      await service.pro.updatePro(req.tokenData!.userId!, req.body)
      res.status(201).send()
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

  router.post(
    '/manual',
    ah(async (req, res) => {
      const data = await service.pro.getManualPro({
        latitude: req.body.latitude,
        longitude: req.body.longitude,
        subServiceId: req.body.subServiceId,
        userId: req.body.userId,
      })
      res.status(200).send({ data })
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

  router.post(
    '/:proId/reviews',
    ah(async (req, res) => {
      const data = await service.pro.getProReviews({
        proId: +req.params.proId as number,
        ...req.body,
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
    ah(async (req, res) => {
      const result = await upload({
        file: req.files?.['applicationvideo'] as any,
        type: 'video',
        prefix: `applicationvideo/pro/${req.tokenData?.userId}/${nanoid()}`,
        fieldName: 'applicationvideo',
        acl: 'public-read',
      })

      await service.pro.uploadApplicationVideo({
        proId: req.tokenData!.userId!,
        workVideoUrl: STORAGE_ENDPOINT_CDN + result.key,
        workVideoKey: result.key as string,
        workVideoOriginalFileName: result.originalName as string,
      })
      res.status(201).send()
    }),
  )

  router.post(
    '/profilephoto',
    allowOnly([ROLES.PRO]),
    ah(async (req, res) => {
      const result = await upload({
        file: req.files?.['profilephoto'] as any,
        type: 'image',
        prefix: `profilephoto/pro/${req.tokenData?.userId}/${nanoid()}`,
        fieldName: 'profilephoto',
        acl: 'public-read',
      })

      const data = await service.pro.uploadProfilePhoto({
        proId: req.tokenData!.userId!,
        tempProfilePhotoKey: result.key as string,
        tempProfilePhotoOriginalFileName: result.originalName as string,
        tempProfilePhotoUrl: STORAGE_ENDPOINT_CDN + result.key,
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

  router.get(
    '/booking/ratio/:proId/:period',
    allowOnly([ROLES.PRO]),
    ah(async (req, res) => {
      const data = await service.pro.getProBookingRatio({
        proId: +req.params.proId!,
        period: req.params.period as GetProBookingRatioReq['period'],
      })
      res.status(200).send({ data })
    }),
  )

  router.get(
    '/:proId',
    ah(async (req, res) => {
      const data = await service.pro.getProInfo({
        proId: +req.params.proId as number,
      })
      res.status(200).send({ data })
    }),
  )

  return router
}

export default makeProRouter
