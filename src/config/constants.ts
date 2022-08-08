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
} as const

export const OTP_TYPE = {
  EMAIL: 'email',
  PHONE: 'phone',
} as const
