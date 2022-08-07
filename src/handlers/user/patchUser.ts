import { Request, Response } from 'express'
import { Service } from '../../types'

export const patchUser =
  ({ service }: { service: Service }) =>
  async (req: Request, res: Response) => {
    await service.user.updateUser(req.body)
    res.sendStatus(201)
  }
