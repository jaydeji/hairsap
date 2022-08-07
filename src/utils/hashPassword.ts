import { createHmac } from 'crypto'

export enum ALGORITHM_NAMES {
  SHA1 = 'sha1',
  SHA256 = 'sha256',
}

const hashPassword = (plainTextPassword: string): string => {
  return createHmac(
    ALGORITHM_NAMES.SHA256,
    process.env.DATA_ENCRYPTION_KEY || '',
  )
    .update(plainTextPassword)
    .digest('hex')
}

export { hashPassword }
