import type { Router } from 'express'
import ah from 'express-async-handler'
import { ROLES } from '../../config/constants'
import { allowOnly } from '../../middleware/auth'
import type { Role, Service } from '../../types'

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
      const data = await service.pro.updatePro(req.tokenData!.userId!, req.body)
      res.status(200).send({ data })
    }),
  )

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

  router.post(
    '/verify:id',
    ah(async (req, res) => {
      await service.pro.verifyPro({
        userId: +req.params.userId as number,
        role: req.tokenData?.role as Role,
      })
      res.status(201).send()
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
    allowOnly([ROLES.PRO]),
    ah(async (req, res) => {
      const data = await service.pro.searchPro({
        name: req.body.name,
      })
      res.status(200).send({ data })
    }),
  )

  return router
}

export default makeProRouter
