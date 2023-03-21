import { DISCOUNT } from '../../config/constants'
import { Prisma } from '@prisma/client'

export const resolveAmount = ({
  invoice,
  transport,
  code,
  pinAmount,
}: {
  invoice: number
  transport: number
  code?: string
  pinAmount: number
}) => {
  const amount = invoice + transport - pinAmount
  switch (code) {
    case DISCOUNT.FIVE_PERCENT: {
      return {
        amount,
        total: amount - 0.05 * invoice,
        promoAmount: 0.05 * invoice,
      }
    }
    case DISCOUNT.TWENTY_PERCENT: {
      return {
        amount,
        total: amount - 0.2 * invoice,
        promoAmount: 0.2 * invoice,
      }
    }
    case DISCOUNT.TEN_PERCENT: {
      return {
        amount,
        total: amount - 0.1 * invoice,
        promoAmount: 0.1 * invoice,
      }
    }
    case DISCOUNT.FIFTY_PERCENT: {
      return {
        amount,
        total: amount - 0.5 * invoice,
        promoAmount: 0.5 * invoice,
      }
    }
    default:
      return { amount, total: invoice, promoAmount: 0 }
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
    pinAmount: true,
  },
})

type BookingWithTotal = Prisma.BookingGetPayload<typeof bookingWithTotal>

export const computeBookingTotal = (booking: BookingWithTotal) => {
  return {
    ...booking,
    total: resolveAmount({
      invoice:
        booking?.invoice?.invoiceFees.reduce((acc, e) => acc + e.price, 0) || 0,
      transport: booking?.invoice?.transportFee || 0,
      code: booking?.invoice?.promo?.discount.name,
      pinAmount: booking.pinAmount,
    }).total,
  }
}
