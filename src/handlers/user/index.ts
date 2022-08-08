import type { Router } from 'express'
import ah from 'express-async-handler'
import { BUCKET } from '../../config/constants'
import { upload } from '../../config/multer-cloud'
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
  return router
}

export default makeUserRouter
