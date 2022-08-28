import type { Router } from 'express'
import ah from 'express-async-handler'
import { ROLES, STORAGE_ENDPOINT_CDN } from '../../config/constants'
import type { Role, Service } from '../../types'
import { ValidationError } from '../../utils/Error'
import { _upload } from '../../config/multer-cloud'
import { allowOnly } from '../../middleware/auth'
import { nanoid } from 'nanoid'

const makeBookingRouter = ({
  router,
  service,
}: {
  router: Router
  service: Service
}) => {
  router.post(
    '/',
    _upload({
      getKey: (file, req) =>
        `samplephoto/user/${req.tokenData?.userId}/${nanoid()}/${
          file.originalname
        }`,
      type: 'image',
      acl: 'public-read',
    }).fields([
      { name: 'payload', maxCount: 1 },
      { name: 'samplePhoto', maxCount: 1 },
    ]),
    ah(async (req, res) => {
      let body
      try {
        body = JSON.parse(req.body.payload)
        if (typeof body !== 'object')
          throw new Error('Unexpected end of JSON input')
      } catch (error) {
        throw new ValidationError((error as Error).message)
      }

      const files = req.files as {
        [fieldname: string]: Express.Multer.File[]
      }
      const file = files['samplePhoto'][0]

      const data = await service.book.bookPro({
        userId: req.tokenData?.userId as number,
        proId: body.proId,
        subServiceId: body.subServiceId, //TODO: multiple subservice?
        latitude: body.latitude,
        longitude: body.longitude,
        address: body.address,
        channel: body.channel,
        samplePhotoKey: (file as any).key,
        samplePhotoOriginalFileName: file.originalname,
        samplePhotoUrl: STORAGE_ENDPOINT_CDN + (file as any).key,
      })
      res.status(200).send({ data })
    }),
  )

  router.get(
    '/accepted',
    ah(async (req, res) => {
      const data = await service.book.getAcceptedProBookings({
        userId: req.tokenData?.userId as number,
      })
      res.status(200).send({ data })
    }),
  )

  router.patch(
    '/:id/add',
    ah(async (req, res) => {
      await service.book.addServiceToBooking({
        subServiceId: req.body.subServiceId,
        bookingId: req.body.bookingId,
        userId: req.tokenData?.userId as number,
      })
      res.status(201).send()
    }),
  )

  router.post(
    '/:id/accept',
    ah(async (req, res) => {
      await service.book.acceptBooking({
        bookingId: +req.params.id,
        userId: req.tokenData?.userId as number,
        role: req.tokenData?.role as Role,
      })
      res.status(201).send()
    }),
  )

  router.post(
    '/:id/cancel',
    ah(async (req, res) => {
      await service.book.cancelBooking({
        bookingId: +req.params.id,
        userId: req.tokenData?.userId as number,
        role: req.tokenData?.role as Role,
      })
      res.status(201).send()
    }),
  )

  router.post(
    '/:id/reject',
    allowOnly([ROLES.PRO]),
    ah(async (req, res) => {
      const data = await service.book.rejectBooking({
        bookingId: +req.params.id,
        userId: req.tokenData?.userId as number,
      })
      res.status(200).send({ data })
    }),
  )

  router.post(
    '/:id/completed',
    allowOnly([ROLES.PRO]),
    ah(async (req, res) => {
      await service.book.markBookingAsCompleted({
        bookingId: +req.params.id,
        proId: req.tokenData?.userId as number,
      })
      res.status(201).send()
    }),
  )

  router.post(
    '/:id/arrived',
    allowOnly([ROLES.PRO]),
    ah(async (req, res) => {
      await service.book.markBookingAsArrived({
        bookingId: +req.params.id,
        proId: req.tokenData?.userId as number,
      })
      res.status(201).send()
    }),
  )

  router.patch(
    '/:id/intransit',
    allowOnly([ROLES.PRO]),
    ah(async (req, res) => {
      await service.book.markBookingAsIntransit({
        bookingId: +req.params.id,
        proId: req.tokenData?.userId as number,
      })
      res.status(201).send()
    }),
  )

  router.get(
    '/:userId/activity',
    allowOnly([ROLES.PRO]),
    ah(async (req, res) => {
      const data = await service.book.getUncompletedBookings({
        userId: +req.params.userId as number,
      })
      res.status(200).send({ data })
    }),
  )

  router.post(
    '/:id/rate',
    allowOnly([ROLES.USER]),
    ah(async (req, res) => {
      const data = await service.book.rateAndReviewBooking({
        bookingId: +req.params.id as number,
        userId: +req.params.userId as number,
        ...req.body,
      })
      res.status(200).send({ data })
    }),
  )

  router.get(
    '/transactions',
    ah(async (req, res) => {
      const data = await service.book.getTransactions({
        userId: +req.tokenData!.userId!,
      })
      res.status(200).send({ data })
    }),
  )

  return router
}

export default makeBookingRouter
