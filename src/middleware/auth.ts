import { NextFunction, Request, Response } from 'express'
import { UnauthorizedError } from '../utils/Error'
import { decodeJwt, verifyJwt } from '../utils/jwtLib'
import ah from 'express-async-handler'
import { ROLES } from '../config/constants'

const auth = () =>
  ah((req: Request, res: Response, next: NextFunction) => {
    let token = req.headers.authorization
    if (!token) throw new UnauthorizedError()
    token = token.replace(/Bearer /g, '')
    const decodedToken = decodeJwt(token)
    try {
      verifyJwt(token, decodedToken?.role === ROLES.ADMIN)
    } catch (error) {
      throw new UnauthorizedError()
    }

    req.tokenData = decodedToken
    next()
  })

export default auth
