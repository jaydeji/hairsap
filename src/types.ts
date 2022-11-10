import {
  BOOKING_STATUS,
  BUCKET,
  CHANNEL,
  MESSAGE_TYPE,
  NOTIFICATION_TYPE,
  OTP_TYPE,
  PRO_STATUS,
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
export type ProStatus = typeof PRO_STATUS[keyof typeof PRO_STATUS]
export type Channel = typeof CHANNEL[keyof typeof CHANNEL]
export type Notificationtype =
  typeof NOTIFICATION_TYPE[keyof typeof NOTIFICATION_TYPE]
