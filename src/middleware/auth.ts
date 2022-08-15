import { NextFunction, Request, Response } from 'express'
import { ForbiddenError, UnauthorizedError } from '../utils/Error'
import { decodeJwt, verifyJwt } from '../utils/jwtLib'
import ah from 'express-async-handler'
import { ROLES } from '../config/constants'
import { Repo } from '../types'

const auth = ({ repo }: { repo: Repo }) =>
  ah(async (req: Request, res: Response, next: NextFunction) => {
    let token = req.headers.authorization
    if (!token) throw new UnauthorizedError()
    token = token.replace(/Bearer /g, '')

    const decodedToken = decodeJwt(token)

    try {
      verifyJwt(token, decodedToken?.role === ROLES.ADMIN)
    } catch (error) {
      throw new UnauthorizedError()
    }

    const user = await repo.user.getUserById(decodedToken?.userId as number)
    if (!user) throw new UnauthorizedError()

    if (decodedToken?.role === ROLES.PRO && !user.verified)
      throw new ForbiddenError('user not verified')

    if (user.terminated) throw new ForbiddenError('user terminated')

    if (user.deactivated && req.baseUrl + req.path !== '/reactivate/request')
      throw new ForbiddenError('user deactivated')

    req.tokenData = decodedToken

    next()
  })

export default auth
