import { Request, Response } from 'express'
import { Service } from '../../types'

export const patchUser =
  ({ service }: { service: Service }) =>
  async (req: Request, res: Response) => {
    await service.user.updateUser(
      res.locals.tokenData?.userId as number,
      req.body,
    )
    res.sendStatus(201)
  }
