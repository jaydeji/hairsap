import type { Router } from 'express'
import ah from 'express-async-handler'
import type { Service } from '../../types'
import { isNumericString, makeStringNumeric } from '../../utils'

//TODO:

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
  router.get(
    '/:userid',
    ah(async (req, res) => {
      const data = await service.chat.getChatById({
        userId: req.tokenData?.userId as number,
        otherUserId: makeStringNumeric(req.params.userid) as number,
        cursor: isNumericString(req.query.cursor)
          ? (makeStringNumeric(req.query.cursor) as number)
          : undefined,
        desc: req.query.desc === 'true',
        take: makeStringNumeric(req.query.take) as number,
      })
      res.send({ data })
    }),
  )

  return router
}

export default makeChatRouter
