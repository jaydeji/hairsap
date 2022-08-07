import jwt from 'jsonwebtoken'

const generateJwt = (
  data: Record<string, unknown>,
  expiresIn?: { expiresIn: string },
): string | undefined => {
  const jwtSecret = process.env.JWT_SECRET || ''
  if (!jwtSecret || jwtSecret === '') return
  return jwt.sign(data, jwtSecret, expiresIn)
}

const generateAdminJwt = (
  data: Record<string, unknown>,
  expiresIn?: { expiresIn: string },
): string | undefined => {
  const jwtSecret = process.env.JWT_ADMIN_SECRET || ''
  if (!jwtSecret || jwtSecret === '') return
  return jwt.sign(data, jwtSecret, expiresIn)
}

export { generateJwt, generateAdminJwt }
