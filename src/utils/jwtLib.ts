import jwt from 'jsonwebtoken'
import { ForbiddenError } from './Error'

const generateJwt = (
  data: Record<string, unknown>,
  admin: boolean,
  expiresIn?: { expiresIn: string },
): string | undefined => {
  const secret =
    (admin ? process.env.JWT_ADMIN_SECRET : process.env.JWT_SECRET) || ''
  if (!secret || secret === '') return
  return jwt.sign(data, secret, expiresIn)
}

const verifyJwt = (token: string, admin: boolean) => {
  const secret =
    (admin ? process.env.JWT_ADMIN_SECRET : process.env.JWT_SECRET) || ''

  return jwt.verify(token, secret, async (error, decoded) => {
    if (error)
      if (decoded) {
        return decoded
      } else {
        throw new ForbiddenError()
      }
  })
}

export { generateJwt, verifyJwt }
