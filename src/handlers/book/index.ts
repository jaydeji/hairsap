import type { Router } from 'express'
import ah from 'express-async-handler'
import type { Role, Service } from '../../types'

const makeBookingRouter = ({
  router,
  service,
}: {
  router: Router
  service: Service
}) => {
  router.post(
    '/',
    ah(async (req, res) => {
      const data = await service.book.bookPro({
        userId: req.tokenData?.userId as number,
        proId: req.body.userId,
        subServiceId: req.body.subServiceId,
        latitude: req.body.latitude,
        longitude: req.body.longitude,
        address: req.body.address,
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
    ah(async (req, res) => {
      const data = await service.book.rejectBooking({
        bookingId: +req.params.id,
        userId: req.tokenData?.userId as number,
        role: req.tokenData?.role as Role,
      })
      res.status(200).send({ data })
    }),
  )

  router.post(
    '/:id/completed',
    ah(async (req, res) => {
      const data = await service.book.markBookingAsCompleted({
        bookingId: +req.params.id,
        userId: req.tokenData?.userId as number,
        role: req.tokenData?.role as Role,
      })
      res.status(200).send({ data })
    }),
  )

  return router
}

export default makeBookingRouter
