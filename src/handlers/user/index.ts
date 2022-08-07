import type { Router } from 'express'
import ah from 'express-async-handler'
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
  return router
}

export default makeUserRouter
