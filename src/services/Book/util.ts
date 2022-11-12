import { DISCOUNT } from '../../config/constants'

export const resolvePromo = (amount: number, code?: string) => {
  switch (code) {
    case DISCOUNT.FIVE_PERCENT: {
      return {
        amount,
        amountLessPromo: amount - 0.05 * amount,
        promoAmount: 0.05 * amount,
      }
    }
    case DISCOUNT.TWENTY_PERCENT: {
      return {
        amount,
        amountLessPromo: amount - 0.2 * amount,
        promoAmount: 0.2 * amount,
      }
    }
    case DISCOUNT.TEN_PERCENT: {
      return {
        amount,
        amountLessPromo: amount - 0.1 * amount,
        promoAmount: 0.1 * amount,
      }
    }
    default:
      return { amount, amountLessPromo: amount, promoAmount: 0 }
  }
}
