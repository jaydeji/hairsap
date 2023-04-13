import type { Router } from 'express'
import ah from 'express-async-handler'
import { ROLES } from '../../config/constants'
import { allowOnly } from '../../middleware/auth'
import type { Service } from '../../types'

const makeAdminRouter = ({
  router,
  service,
}: {
  router: Router
  service: Service
}) => {
  router.post(
    '/reactivate/accept/:userId',
    allowOnly([ROLES.ADMIN]),
    ah(async (req, res) => {
      await service.admin.acceptReactivation({
        userId: +req.params.userId as number,
      })
      res.status(201).send()
    }),
  )

  router.post(
    '/payout/requests',
    ah(async (req, res) => {
      const data = await service.admin.getPayoutRequests(req.body)
      res.status(200).send(data)
    }),
  )

  router.post(
    '/payout/:proId/request',
    ah(async (req, res) => {
      await service.admin.requestPayout(+req.params.proId)
      res.status(201).send()
    }),
  )

  router.post(
    '/payout/:invoiceId/confirm',
    ah(async (req, res) => {
      await service.admin.confirmPayoutRequest(+req.params.invoiceId)
      res.status(201).send()
    }),
  )

  router.get(
    '/proapplications',
    ah(async (_req, res) => {
      const data = await service.admin.getProApplications()
      res.status(200).send(data)
    }),
  )

  router.post(
    '/proapplication/:userId/:action',
    ah(async (req, res) => {
      await service.admin.acceptOrRejectApplication({
        action: req.params.action,
        userId: +req.params.userId,
      })
      res.sendStatus(201)
    }),
  )

  router.get(
    '/proapplication/:proId',
    ah(async (req, res) => {
      const data = await service.admin.getApplicationVideo(+req.params.proId)
      res.status(201).send({ data })
    }),
  )

  router.get(
    '/pros/stats',
    ah(async (_req, res) => {
      const data = await service.pro.getAdminProStats()
      res.status(200).send({ data })
    }),
  )

  router.post(
    '/pros',
    ah(async (req, res) => {
      const data = await service.pro.getAllPros({
        name: req.body.name,
        serviceId: req.body.serviceId,
        page: req.body.page,
        perPage: req.body.perPage,
      })
      res.status(200).send({ data })
    }),
  )

  router.post(
    '/users',
    ah(async (req, res) => {
      const data = await service.user.getAllUsers({
        name: req.body.name,
        page: req.body.page,
        perPage: req.body.perPage,
      })
      res.status(200).send({ data })
    }),
  )

  router.get<{ userId: string }>(
    '/users/:userId',
    ah(async (req, res) => {
      const data = await service.user.getUserDetails({
        userId: +req.params.userId,
      })
      res.status(200).send({ data })
    }),
  )

  router.get<{ userId: string }>(
    '/pros/:userId',
    ah(async (req, res) => {
      const data = await service.pro.getProDetails({
        userId: +req.params.userId,
      })
      res.status(200).send({ data })
    }),
  )

  router.post(
    '/userbookings',
    ah(async (req, res) => {
      const data = await service.book.getUserBookings({
        userId: req.body.userId,
        page: req.body.page,
        perPage: req.body.perPage,
      })
      res.status(200).send({ data })
    }),
  )

  router.post(
    '/probookings',
    ah(async (req, res) => {
      const data = await service.book.getProBookings({
        proId: req.body.proId,
        status: req.body.status,
        period: req.body.period,
      })
      res.status(200).send({ data })
    }),
  )

  router.get(
    '/bonuses',
    ah(async (_req, res) => {
      const data = await service.book.getUnpaidBonuses()
      res.status(200).send(data)
    }),
  )

  router.post(
    '/bonuses/:bonusId/paid',
    ah(async (req, res) => {
      await service.book.markBonusAsPaid({ bonusId: +req.query!.bonusId! })
      res.status(201).send()
    }),
  )

  router.post(
    '/dashboard/bookings/discounted',
    ah(async (_req, res) => {
      const data = await service.admin.getDashboardDiscountedBookingStats()
      res.status(200).send(data)
    }),
  )

  router.get(
    '/dashboard/bookings/pinned',
    ah(async (_req, res) => {
      const data = await service.admin.getDashboardPinnedBookingStats()
      res.status(200).send(data)
    }),
  )

  router.post(
    '/dashboard/bookings/completed',
    ah(async (_req, res) => {
      const data = await service.admin.getDashboardCompletedBookingStats()
      res.status(200).send(data)
    }),
  )

  router.post(
    '/dashboard/bookings',
    ah(async (req, res) => {
      const data = await service.admin.getDashboardBookingStats(req.body)
      res.status(200).send(data)
    }),
  )

  router.get(
    '/dashboard',
    ah(async (_req, res) => {
      const data = await service.admin.getDashboardStats()
      res.status(200).send(data)
    }),
  )

  router.post(
    '/unacceptedprophotos/:proId/accept',
    ah(async (req, res) => {
      await service.admin.acceptUnacceptedProPhotos(+req.params.proId)
      res.status(201).send()
    }),
  )

  router.get(
    '/unacceptedprophotos',
    ah(async (_req, res) => {
      const data = await service.admin.getUnacceptedProPhotos()
      res.status(200).send({ data })
    }),
  )

  router.post(
    '/deactivatepro/:id',
    ah(async (req, res) => {
      const data = await service.admin.deactivatePro(+req.params.id)
      res.status(201).send({ data })
    }),
  )

  router.delete(
    '/user/:id',
    ah(async (req, res) => {
      await service.other.deactivateUserOrPro({
        userId: +req.params.id,
      })

      res.status(201).send()
    }),
  )
  router.post(
    '/push_notification',
    ah(async (req, res) => {
      await service.admin.sendPushNotification(req.body)

      res.status(201).send()
    }),
  )

  return router
}

export default makeAdminRouter
