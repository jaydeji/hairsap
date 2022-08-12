import type { Router } from 'express'
import ah from 'express-async-handler'
import type { Service } from '../../types'

const makeProRouter = ({
  router,
  service,
}: {
  router: Router
  service: Service
}) => {
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
  return router
}

export default makeProRouter
