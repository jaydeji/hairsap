import { NextFunction, Request, Response } from 'express'
import { ForbiddenError } from '../utils/Error'
import ah from 'express-async-handler'
import { ROLES } from '../config/constants'
import { Repo } from '../types'

const admin = () =>
  ah(async (req: Request, res: Response, next: NextFunction) => {
    if (req.tokenData?.role !== ROLES.ADMIN) throw new ForbiddenError()
    next()
  })

export default admin
