import type { Router } from 'express'
import ah from 'express-async-handler'
import { ROLES, STORAGE_ENDPOINT_CDN } from '../../config/constants'
import type { Role, Service } from '../../types'
import { ValidationError } from '../../utils/Error'
import { _upload } from '../../config/multer-cloud'
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
        subServiceId: body.subServiceId,
        latitude: body.latitude,
        longitude: body.longitude,
        address: body.address,
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
    '/:id/:role/completed',
    ah(async (req, res) => {
      let data
      if (req.params.role === ROLES.USER) {
        data = await service.book.markBookingAsUserCompleted({
          bookingId: +req.params.id,
          userId: req.tokenData?.userId as number,
          role: req.tokenData?.role as Role,
        })
      } else {
        data = await service.book.markBookingAsProCompleted({
          bookingId: +req.params.id,
          proId: req.tokenData?.proId as number,
          role: req.tokenData?.role as Role,
        })
      }
      res.status(200).send({ data })
    }),
  )

  return router
}

export default makeBookingRouter
