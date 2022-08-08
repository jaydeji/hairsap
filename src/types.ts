import {
  BOOKING_STATUS,
  BUCKET,
  MESSAGE_TYPE,
  OTP_TYPE,
  ROLES,
} from './config/constants'
import makeRepo from './repo'
import makeServices from './services'

export type Repo = ReturnType<typeof makeRepo>
export type Service = ReturnType<typeof makeServices>

interface HsapBody {
  message: string
  validationError?: any
  data?: any
}

export interface HsapResponse {
  statusCode: number
  body: Omit<HsapBody, 'validationError'> | Omit<HsapBody, 'data'>
}

export type HsapError = Error
export type Role = typeof ROLES[keyof typeof ROLES]
export type MessageType = typeof MESSAGE_TYPE[keyof typeof MESSAGE_TYPE]
export type BookingStatus = typeof BOOKING_STATUS[keyof typeof BOOKING_STATUS]
export type OtpType = typeof OTP_TYPE[keyof typeof OTP_TYPE]
export type BucketType = typeof BUCKET[keyof typeof BUCKET]
