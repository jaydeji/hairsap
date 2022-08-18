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

  return router
}

export default makeAdminRouter
