import type { Router } from 'express'
import ah from 'express-async-handler'
import { STORAGE_ENDPOINT_CDN } from '../../config/constants'
import { upload } from '../../config/multer-cloud'
import type { Service } from '../../types'
import { uniqueId } from '../../utils'

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
    ah(async (req, res) => {
      const result = await upload({
        file: req.files?.['chatphoto'] as any,
        type: 'image',
        prefix: `chat/photo/${req.tokenData?.userId}/${uniqueId()}`,
        fieldName: 'chatphoto',
        acl: 'public-read',
      })

      res.status(200).send({
        data: {
          url: STORAGE_ENDPOINT_CDN + result.key,
        },
      })
    }),
  )

  return router
}

export default makeChatRouter
