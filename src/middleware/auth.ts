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

    if (decodedToken?.role === ROLES.ADMIN) {
      const admin = await repo.admin.getAdminById(
        decodedToken?.adminId as number,
      )
      if (!admin) throw new UnauthorizedError()
    }

    if (decodedToken?.role === ROLES.PRO) {
      const pro = await repo.pro.getProById(decodedToken?.proId as number)
      if (!pro) throw new UnauthorizedError()
      if (!pro.verified) throw new ForbiddenError('pro not verified')
      if (pro.terminated) throw new ForbiddenError('pro terminated')
      if (pro.deactivated && req.baseUrl + req.path !== '/reactivate/request')
        throw new ForbiddenError('user deactivated')
    }

    if (decodedToken?.role === ROLES.USER) {
      const user = await repo.user.getUserById(decodedToken?.userId as number)
      if (!user) throw new UnauthorizedError()
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
