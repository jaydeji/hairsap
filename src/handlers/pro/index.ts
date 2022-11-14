import type { Router } from 'express'
import ah from 'express-async-handler'
import { ROLES, STORAGE_ENDPOINT_CDN } from '../../config/constants'
import { upload } from '../../config/multer-cloud'
import { allowOnly, denyOnly } from '../../middleware/auth'
import { GetProBookingRatioReq } from '../../schemas/request/getProBookingRatio'
import { computeBookingTotal } from '../../services/Book/util'
import type { Role, Service } from '../../types'
import { logger, uniqueId } from '../../utils'
import { InternalError, ValidationError } from '../../utils/Error'

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
    '/auto/book',
    ah(async (req, res) => {
      let body
      try {
        body = JSON.parse(req.body.payload)
        if (typeof body !== 'object')
          throw new Error('Unexpected end of JSON input')
      } catch (error) {
        throw new ValidationError((error as Error).message)
      }

      const result = await upload({
        file: req.files?.['samplephoto'] as any,
        type: 'image',
        prefix: `samplephoto/user/${req.tokenData?.userId}/${uniqueId()}`,
        fieldName: 'samplephoto',
        acl: 'public-read',
        optional: true,
      })

      const data = await service.book.autoBook({
        userId: req.tokenData?.userId as number,
        lastProId: body.lastProId,
        subServiceId: body.subServiceId, //TODO: multiple subservice?
        latitude: body.latitude,
        longitude: body.longitude,
        distance: body.distance,
        address: body.address,
        channel: body.channel,
        samplePhotoKey: result?.key,
        samplePhotoOriginalFileName: result?.originalName,
        samplePhotoUrl: result?.url,
        code: body.code,
        auto: true,
      })

      res.status(200).send({ data: data ? computeBookingTotal(data) : {} })
    }),
  )

  // router.post(
  //   '/auto',
  //   ah(async (req, res) => {
  //     const data = await service.pro.getNearestPro({
  //       latitude: req.body.latitude,
  //       longitude: req.body.longitude,
  //       subServiceId: req.body.subServiceId,
  //       distance: req.body.distance,
  //       userId: req.body.userId,
  //     })

  //     res.status(200).send({ data })
  //   }),
  // )

  router.post(
    '/manual/book',
    ah(async (req, res) => {
      let body
      try {
        body = JSON.parse(req.body.payload)
        if (typeof body !== 'object')
          throw new Error('Unexpected end of JSON input')
      } catch (error) {
        throw new ValidationError((error as Error).message)
      }

      const result = await upload({
        file: req.files?.['samplephoto'] as any,
        type: 'image',
        prefix: `samplephoto/user/${req.tokenData?.userId}/${uniqueId()}`,
        fieldName: 'samplephoto',
        acl: 'public-read',
        optional: true,
      })

      const data = await service.book.manualBook({
        userId: req.tokenData?.userId as number,
        proId: body.proId,
        subServiceId: body.subServiceId, //TODO: multiple subservice?
        latitude: body.latitude,
        longitude: body.longitude,
        address: body.address,
        channel: body.channel,
        samplePhotoKey: result?.key,
        samplePhotoOriginalFileName: result?.originalName,
        samplePhotoUrl: result?.url,
        code: body.code,
        auto: false,
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
        prefix: `applicationvideo/pro/${req.tokenData?.userId}/${uniqueId()}`,
        fieldName: 'applicationvideo',
        acl: 'public-read',
      })

      if (!result) {
        logger.err('error uploading application videp')
        throw new InternalError('error uploading application videp')
      }

      await service.pro.uploadApplicationVideo({
        proId: req.tokenData!.userId!,
        workVideoUrl: result.url,
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
        prefix: `profilephoto/pro/${req.tokenData?.userId}/${uniqueId()}`,
        fieldName: 'profilephoto',
        acl: 'public-read',
      })

      if (!result) {
        logger.err('error uploading photo')
        throw new InternalError('error uploading photo')
      }

      const data = await service.pro.uploadProfilePhoto({
        proId: req.tokenData!.userId!,
        tempProfilePhotoKey: result.key as string,
        tempProfilePhotoOriginalFileName: result.originalName as string,
        tempProfilePhotoUrl: result.url,
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
        userId: req.tokenData!.userId!,
      })
      res.status(200).send({ data })
    }),
  )

  return router
}

export default makeProRouter
