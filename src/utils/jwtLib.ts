import { Request } from 'express'
import jwt from 'jsonwebtoken'

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

const decodeJwt = (token: string) => {
  return jwt.decode(token) as Request['tokenData']
}

const verifyJwt = (token: string, isAdmin: boolean) => {
  const secret =
    (isAdmin ? process.env.JWT_ADMIN_SECRET : process.env.JWT_SECRET) || ''

  return jwt.verify(token, secret)
}

export { generateJwt, decodeJwt, verifyJwt }
