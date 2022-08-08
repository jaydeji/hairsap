import { NextFunction, Request, Response } from 'express'
import { ForbiddenError, UnauthorizedError } from '../utils/Error'
import { decodeJwt, verifyJwt } from '../utils/jwtLib'
import ah from 'express-async-handler'

const auth = () =>
  ah((req: Request, res: Response, next: NextFunction) => {
    let token = req.headers.authorization
    if (!token) throw new UnauthorizedError()
    token = token.replace(/Bearer /g, '')
    const decodedToken = decodeJwt(token)
    try {
      verifyJwt(token, decodedToken?.admin as boolean)
    } catch (error) {
      throw new ForbiddenError()
    }

    ;(req as any).tokenData = decodedToken
    next()
  })

export default auth
