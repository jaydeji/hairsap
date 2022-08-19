export const DEACTIVATION_REASONS = {
  WEEKLY: 'Weekly Task Target Default',
  RATIO: 'Weekly Returned completed booking Ratio default',
  HOURS: 'Over 48hours redemption payout payment',
} as const

export const ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  PRO: 'pro',
} as const

export const MESSAGE_TYPE = {
  TEXT: 'text',
  PHOTO: 'photo',
} as const

export const BOOKING_STATUS = {
  CANCELLED: 'cancelled',
  REJECTED: 'rejected',
  ACCEPTED: 'accepted',
  COMPLETED: 'completed',
  PENDING: 'pending',
} as const

export const OTP_TYPE = {
  EMAIL: 'email',
  PHONE: 'phone',
} as const

export const BUCKET = {
  PHOTO: 'photo',
  VIDEO: 'video',
} as const

export const PRO_STATUS = {
  AVAILABLE: 'available',
} as const

export const PLACEHOLDER =
  'https://avatars.dicebear.com/api/adventurer/hairsap.svg'
export const STORAGE_ENDPOINT = 'https://' + process.env.STORAGE_ENDPOINT
export const STORAGE_ENDPOINT_CDN =
  'https://hairsap.' + process.env.STORAGE_ENDPOINT_CDN + '/'

export const PERIODIC_CASH_AMOUNTS = {
  DAILY: 50_000 * 100,
  MONTHLY: 125_000 * 100,
  WEEKLY_EARNING: 125_000 * 100, //affected by deductions and bonus
  WEEKLY_BONUS: 25_000 * 100,
  WEEKLY_BONUS_QUOTA: 375_000 * 100,
}
