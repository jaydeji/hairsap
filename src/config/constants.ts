export const DEACTIVATION_REASONS = {
  WEEKLY: { amount: 50_000 * 100, reason: 'Weekly Task Target Default' },
  RATIO: {
    amount: 50_000 * 100,
    reason: 'Weekly Returned completed booking Ratio default',
  },
  HOURS: {
    amount: 10_000 * 100,
    reason: 'Over 48hours redemption payout payment',
  },
  RATING: { amount: 50_000 * 100, reason: 'Weekly Star Rating insufficient' },
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

export const FROM = {
  NOTIFICATION: 'notification@hairsap.com',
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
  // WEEKLY_EARNING: 125_000 * 100, //affected by deductions and bonus
  DAILY_TASK_TARGET: 20_000 * 100,
  MONTHLY_TASK_TARGET: 1_400_000 * 100,
  DAILY_REDEEM_THRESHOLD: 30_000 * 100,
  WEEKLY_TASK_TARGET: 100_000 * 100, //affected by deductions and bonus and weekly booking number is above 25
  WEEKLY_BONUS: 25_000 * 100,
  WEEKLY_BONUS_QUOTA: 420_000 * 100,
  PRO_EARNING_PERCENT: 0.7,
}

export const PIN_AMOUNT = 5_000 * 100

export const PAYSTACK_URL = 'https://api.paystack.co'
export const ADMIN_ID = 1

export const CHANNEL = {
  CASH: 'cash',
  CARD: 'card',
} as const

export const DISCOUNT = {
  FIVE_PERCENT: '5% discount',
  TWENTY_PERCENT: '20% discount',
  TEN_PERCENT: '10% discount',
  FIFTY_PERCENT: '50% discount',
} as const

export const NOTIFICATION_TYPE = {
  BOOKING: 'booking',
  GENERAL: 'general',
} as const

export const PIN_STATUS = {
  /**
   * @deprecated
   */
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  PAID: 'paid',
  CANCELLED: 'cancelled',
} as const
