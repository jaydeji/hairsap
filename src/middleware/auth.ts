import { NextFunction, Request, Response } from 'express'
import { ForbiddenError, UnauthorizedError } from '../utils/Error'
import { decodeJwt, verifyJwt } from '../utils/jwtLib'
import ah from 'express-async-handler'
import { ROLES } from '../config/constants'
import { Repo, Role } from '../types'

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

    if ([ROLES.PRO, ROLES.USER].includes(decodedToken?.role as any)) {
      if (!user.verified && req.baseUrl + req.path !== '/auth/validateotp')
        throw new ForbiddenError('user not verified')
    }
    if (decodedToken?.role === ROLES.PRO) {
      if (user.terminated) throw new ForbiddenError('pro terminated')
      if (user.deactivated && req.baseUrl + req.path !== '/reactivate/request')
        throw new ForbiddenError('pro deactivated')
    }

    req.tokenData = decodedToken

    next()
  })

const allowOnly = (roles: Role[]) =>
  ah(async (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.tokenData!.role)) throw new ForbiddenError()
    next()
  })

const denyOnly = (roles: Role[]) =>
  ah(async (req: Request, res: Response, next: NextFunction) => {
    if (roles.includes(req.tokenData!.role)) throw new ForbiddenError()
    next()
  })

export { auth, allowOnly, denyOnly }
