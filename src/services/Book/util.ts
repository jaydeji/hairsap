import { DISCOUNT } from '../../config/constants'
import { Prisma } from '@prisma/client'

export const resolvePromo = (
  amount: number,
  transport: number,
  code?: string,
) => {
  switch (code) {
    case DISCOUNT.FIVE_PERCENT: {
      return {
        amount: amount + transport,
        amountLessPromo: amount + transport - 0.05 * amount,
        promoAmount: 0.05 * amount,
      }
    }
    case DISCOUNT.TWENTY_PERCENT: {
      return {
        amount: amount + transport,
        amountLessPromo: amount + transport - 0.2 * amount,
        promoAmount: 0.2 * amount,
      }
    }
    case DISCOUNT.TEN_PERCENT: {
      return {
        amount: amount + transport,
        amountLessPromo: amount + transport - 0.1 * amount,
        promoAmount: 0.1 * amount,
      }
    }
    case DISCOUNT.FIFTY_PERCENT: {
      return {
        amount: amount + transport,
        amountLessPromo: amount + transport - 0.5 * amount,
        promoAmount: 0.5 * amount,
      }
    }
    default:
      return { amount, amountLessPromo: amount, promoAmount: 0 }
  }
}

const bookingWithTotal = Prisma.validator<Prisma.BookingArgs>()({
  select: {
    invoice: {
      select: {
        invoiceFees: {
          select: {
            price: true,
          },
        },
        transportFee: true,
        promo: {
          select: {
            discount: { select: { name: true } },
          },
        },
      },
    },
  },
})

type BookingWithTotal = Prisma.BookingGetPayload<typeof bookingWithTotal>

export const computeBookingTotal = (booking: BookingWithTotal) => {
  return {
    ...booking,
    total: resolvePromo(
      booking?.invoice?.invoiceFees.reduce((acc, e) => acc + e.price, 0) || 0,
      booking?.invoice?.transportFee || 0,
      booking?.invoice?.promo?.discount.name,
    ).amountLessPromo,
  }
}
