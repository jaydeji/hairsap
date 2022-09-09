import type { Router } from 'express'
import ah from 'express-async-handler'
import { nanoid } from 'nanoid'
import { STORAGE_ENDPOINT_CDN } from '../../config/constants'
import { _upload } from '../../config/multer-cloud'
import type { Service } from '../../types'

const makeChatRouter = ({
  router,
  service,
}: {
  router: Router
  service: Service
}) => {
  router.get(
    '/',
    ah(async (req, res) => {
      const data = await service.chat.getChatList(
        req.tokenData?.userId as number,
      )
      res.send({ data })
    }),
  )
  router.post(
    '/',
    ah(async (req, res) => {
      const data = await service.chat.getChatById({
        userId: req.tokenData!.userId!,
        otherUserId: req.body.userId,
        cursor: req.body.cursor,
        desc: req.body.desc,
        take: req.body.take,
      })
      res.send({ data })
    }),
  )

  router.post(
    '/photo',
    _upload({
      getKey: (file, req) =>
        `chat/photo/${req.tokenData?.userId}/${nanoid()}/${file.originalname}`,
      type: 'image',
      acl: 'public-read',
    }).single('profilephoto'),
    ah(async (req, res) => {
      res.status(200).send({
        data: {
          url: STORAGE_ENDPOINT_CDN + (req.file as any).key,
        },
      })
    }),
  )

  return router
}

export default makeChatRouter
