import { emailQueue, mainQueue, paymentThreshold } from '../../config/queue'
import type { Router } from 'express'
import ah from 'express-async-handler'
import type { Service } from '../../types'

const makeAuthRouter = ({
  router,
  service,
}: {
  router: Router
  service: Service
}) => {
  router.get(
    '/',
    ah((_req, res) => {
      res.send('Birds home page')
    }),
  )

  router.post(
    '/login',
    ah(async (req, res) => {
      const data = await service.auth.login(req.body)
      emailQueue.add({
        from: '"Hairsap 👥" <notify@hairsap.com>', // sender address
        to: 'jideadedejifirst@gmail.com', // list of receivers
        subject: 'Hello ✔', // Subject line
        text: 'Hello world 🐴', // plaintext body
        html: '<b>Hello world 🐴</b>', // html body
      })
      // mainQueue.add({ email: req.body.email })
      // paymentThreshold.add(
      //   { email: req.body.email },
      //   {
      //     attempts: 3,
      //     backoff: {
      //       type: 'exponential',
      //       delay: 5000,
      //     },
      //     delay: 60 * 60 * 24 * 2 * 1000,
      //     // repeat: {
      //     //   cron: '',
      //     //   startDate: new Date(),
      //     // },
      //     // timeout
      //   },
      // )
      res.status(200).send({ data })
    }),
  )

  return router
}

export default makeAuthRouter
