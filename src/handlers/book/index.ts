import type { Router } from 'express'
import ah from 'express-async-handler'
import type { Service } from '../../types'

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

  router.patch(
    '/:id/add',
    ah(async (req, res) => {
      const data = await service.book.addServiceToBooking({
        subServiceId: req.body.subServiceId,
        bookingId: req.body.bookingId,
        userId: req.tokenData?.userId as number,
      })
      res.status(200).send({ data })
    }),
  )

  return router
}

export default makeBookingRouter
