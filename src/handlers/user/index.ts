import type { Router } from 'express'
import ah from 'express-async-handler'
import { BUCKET, ROLES } from '../../config/constants'
import { upload } from '../../config/multer-cloud'
import { allowOnly } from '../../middleware/auth'
import type { Service } from '../../types'
import { patchUser } from './patchUser'

const makeUserRouter = ({
  router,
  service,
}: {
  router: Router
  service: Service
}) => {
  router.patch('/', ah(patchUser({ service })))
  router.post(
    '/faceid',
    upload({ fileName: 'photo', bucket: BUCKET.PHOTO }),
    ah(async (req, res) => {
      const data = await service.auth.uploadFaceId(
        req.tokenData?.userId as number,
        req.file?.path,
      )
      res.status(200).send({ data })
    }),
  )
  router.post(
    '/subscribe',
    allowOnly([ROLES.USER]),
    ah(async (req, res) => {
      await service.user.subscribe({
        userId: req.tokenData?.userId as number,
        proId: req.body.proId,
      })
      res.sendStatus(201)
    }),
  )
  router.post(
    '/subscriptions',
    allowOnly([ROLES.USER]),
    ah(async (req, res) => {
      const data = await service.user.getUserSubscriptions({
        userId: req.tokenData?.userId as number,
      })
      res.status(200).send({ data })
    }),
  )
  return router
}

export default makeUserRouter
