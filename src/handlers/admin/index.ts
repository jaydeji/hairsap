import type { Router } from 'express'
import ah from 'express-async-handler'
import type { Role, Service } from '../../types'

const makeAdminRouter = ({
  router,
  service,
}: {
  router: Router
  service: Service
}) => {
  router.post(
    '/reactivate/accept/:userId',
    ah(async (req, res) => {
      await service.admin.acceptReactivation({
        userId: +req.params.userId as number,
        role: req.tokenData?.role as Role,
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
    '/proapplication/:userId/:action',
    ah(async (req, res) => {
      await service.admin.acceptOrRejectApplication({
        action: req.params.action,
        userId: +req.params.userId,
      })
      res.sendStatus(201)
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
        userId: req.body.userId,
        page: req.body.page,
        perPage: req.body.perPage,
      })
      res.status(200).send({ data })
    }),
  )

  router.post(
    '/userdetails',
    ah(async (req, res) => {
      const data = await service.user.getUserDetails({
        userId: req.body.userId,
      })
      res.status(200).send({ data })
    }),
  )

  router.post(
    '/prodetails',
    ah(async (req, res) => {
      const data = await service.pro.getProDetails({
        userId: req.body.userId,
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

  return router
}

export default makeAdminRouter
