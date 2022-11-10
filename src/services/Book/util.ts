import { DISCOUNT } from '../../config/constants'

export const resolvePromo = (amount: number, code?: string) => {
  switch (code) {
    case DISCOUNT.FIVE_PERCENT: {
      return amount - 0.05 * amount
    }
    case DISCOUNT.TWENTY_PERCENT: {
      return amount - 0.2 * amount
    }
    default:
      return amount
  }
}
