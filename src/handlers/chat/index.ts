import type { Router } from 'express'
import ah from 'express-async-handler'
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
        userId: req.body.userId,
        otherUserId: req.body.userId,
        cursor: req.body.cursor,
        desc: req.body.desc,
        take: req.body.take,
      })
      res.send({ data })
    }),
  )

  return router
}

export default makeChatRouter
