import type { Router } from 'express'
import ah from 'express-async-handler'
import { ROLES } from '../../config/constants'
import type { Role, Service } from '../../types'
import { allowOnly } from '../../middleware/auth'

const makeBookingRouter = ({
  router,
  service,
}: {
  router: Router
  service: Service
}) => {
  router.patch(
    '/service',
    allowOnly([ROLES.USER]),
    ah(async (req, res) => {
      await service.book.setBookingSubservices({
        subServiceIds: req.body.subServiceIds,
        bookingId: req.body.bookingId,
        userId: req.tokenData?.userId as number,
      })
      res.status(201).send()
    }),
  )

  router.post(
    '/:id/accept',
    allowOnly([ROLES.PRO]),
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
    allowOnly([ROLES.USER]),
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
      await service.book.rejectBooking({
        bookingId: +req.params.id,
        userId: req.tokenData?.userId as number,
      })
      res.status(201).send()
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

  router.patch(
    '/:id/pin/accept',
    allowOnly([ROLES.USER]),
    ah(async (req, res) => {
      const data = await service.book.acceptPinnedBooking({
        bookingId: +req.params.id,
        userId: req.tokenData?.userId as number,
      })
      res.status(201).send({ data })
    }),
  )

  // router.patch(
  //   '/:id/pin/paid',
  //   allowOnly([ROLES.PRO]),
  //   ah(async (req, res) => {
  //     const data = await service.book.markPinnedBookingAsPaid({
  //       bookingId: +req.params.id,
  //       proId: req.tokenData?.userId as number,
  //     })
  //     res.status(201).send({ data })
  //   }),
  // )

  router.patch(
    '/:id/pin/reject',
    allowOnly([ROLES.PRO]),
    ah(async (req, res) => {
      const data = await service.book.rejectPinnedBooking({
        bookingId: +req.params.id,
        proId: req.tokenData?.userId as number,
      })
      res.status(201).send({ data })
    }),
  )

  router.patch(
    '/:id/pin/cancel',
    allowOnly([ROLES.USER]),
    ah(async (req, res) => {
      const data = await service.book.cancelPinnedBooking({
        bookingId: +req.params.id,
        userId: req.tokenData?.userId as number,
      })
      res.status(201).send({ data })
    }),
  )

  router.post(
    '/:id/pin',
    allowOnly([ROLES.PRO]),
    ah(async (req, res) => {
      const data = await service.book.pinBooking({
        bookingId: +req.params.id,
        proId: req.tokenData?.userId as number,
        date: req.body.date,
      })
      res.status(201).send({ data })
    }),
  )

  router.get(
    '/:userId/activity',
    allowOnly([ROLES.PRO, ROLES.USER]),
    ah(async (req, res) => {
      const data = await service.book.getBookingActivity({
        userId: +req.params.userId as number,
      })
      res.status(200).send({ data })
    }),
  )

  router.post(
    '/:id/rate',
    allowOnly([ROLES.USER]),
    ah(async (req, res) => {
      await service.book.rateAndReviewBooking({
        bookingId: +req.params.id as number,
        userId: +req.params.userId as number,
        ...req.body,
      })
      res.status(201).send()
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

  router.get(
    '/accepted',
    allowOnly([ROLES.PRO, ROLES.USER]),
    ah(async (req, res) => {
      const data = await service.book.getAcceptedBookings({
        userId: req.tokenData?.userId as number,
      })
      res.status(200).send({ data })
    }),
  )

  // router.post(
  //   '/',
  //   ah(async (req, res) => {
  //     let body
  //     try {
  //       body = JSON.parse(req.body.payload)
  //       if (typeof body !== 'object')
  //         throw new Error('Unexpected end of JSON input')
  //     } catch (error) {
  //       throw new ValidationError((error as Error).message)
  //     }

  //     const result = await upload({
  //       file: req.files?.['samplephoto'] as any,
  //       type: 'image',
  //       prefix: `samplephoto/user/${req.tokenData?.userId}/${uniqueId()}`,
  //       fieldName: 'samplephoto',
  //       acl: 'public-read',
  //       optional: true,
  //     })

  //     const data = await service.book.bookPro({
  //       userId: req.tokenData?.userId as number,
  //       proId: body.proId,
  //       subServiceId: body.subServiceId, //TODO: multiple subservice?
  //       latitude: body.latitude,
  //       longitude: body.longitude,
  //       address: body.address,
  //       channel: body.channel,
  //       samplePhotoKey: result.key,
  //       samplePhotoOriginalFileName: result.originalName,
  //       samplePhotoUrl: result.url,
  //       code: body.code,
  //     })
  //     res.status(200).send({ data })
  //   }),
  // )

  router.get(
    '/:id',
    ah(async (req, res) => {
      const data = await service.book.getBookingById({
        bookingId: +req.params.id as number,
      })
      res.status(200).send({ data })
    }),
  )

  return router
}

export default makeBookingRouter
