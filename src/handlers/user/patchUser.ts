import { Request, Response } from 'express'
import { Role, Service } from '../../types'

export const patchUser =
  ({ service }: { service: Service }) =>
  async (req: Request, res: Response) => {
    await service.user.updateUser(
      req.tokenData?.userId as number,
      req.tokenData?.role as Role,
      req.body,
    )
    res.sendStatus(201)
  }
