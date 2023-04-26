import { BullIdType, Prisma } from '@prisma/client'
import got from 'got-cjs'
import { z } from 'zod'
import {
  PERIODIC_CASH_AMOUNTS,
  BOOKING_STATUS,
  CHANNEL,
  PAYSTACK_URL,
  ROLES,
  PIN_STATUS,
  PIN_AMOUNT,
} from '../../config/constants'
import { GetAcceptedBookingsReqSchema } from '../../schemas/request/getPendingBookingsSchema'
import {
  GetProBookingsReq,
  GetProBookingsReqSchema,
} from '../../schemas/request/getProBookings'
import {
  GetUserBookingsReq,
  GetUserBookingsReqSchema,
} from '../../schemas/request/getUserBookings'
import { PatchAddServiceSchema } from '../../schemas/request/patchAddService'
import { PostAcceptBookingReqSchema } from '../../schemas/request/postAcceptBooking'
import { PostBookProReqSchema } from '../../schemas/request/postBookPro'
import { PostMarkBookingAsArrivedReqSchema } from '../../schemas/request/postMarkBookingAsArrived'
import { PostMarkBookingAsCompletedReqSchema } from '../../schemas/request/postMarkBookingAsCompleted'
import {
  PostRateBookingReq,
  PostRateBookingReqSchema,
} from '../../schemas/request/postRateBooking'
import type { Channel, Repo, Role } from '../../types'
import {
  getArrivalTime,
  getPageMeta,
  getTransportPrice,
  paginate,
  dayjs,
  logger,
  filterBadWords,
  addCommas,
  uniqueId,
} from '../../utils'
import { ForbiddenError, InternalError, NotFoundError } from '../../utils/Error'
import { Queue } from '../Queue'
import { autoBook } from './autoBook'
import { manualBook } from './manualBook'
import { computeBookingTotal, resolveAmount } from './util'
import { socket } from '../../index'
import Bull from 'bull'
import { CursorSchema } from '../../schemas/models/Cursor'

const bookPro =
  ({ repo, queue }: { repo: Repo; queue: Queue }) =>
  async ({
    samplePhotoOriginalFileName,
    samplePhotoKey,
    samplePhotoUrl,
    ...data
  }: {
    longitude: number
    latitude: number
    subServiceIds: number[]
    userId: number
    proId: number
    address: string
    samplePhotoOriginalFileName?: string
    samplePhotoKey?: string
    samplePhotoUrl?: string
    channel: Channel
    code?: string
  }) => {
    const { longitude, latitude, proId, userId } = data

    PostBookProReqSchema.parse(data)

    const pro = await repo.user.getUserById(data.proId)

    if (!pro?.available) throw new ForbiddenError('Pro is not available')

    const bookings = await repo.book.getProBookingsByStatus(
      proId,
      BOOKING_STATUS.ACCEPTED,
    )

    // if (bookings.length >= 5) throw new ForbiddenError('pro currently busy')

    const userBookingsBySubServices = await Promise.all(
      data.subServiceIds.map((e) =>
        repo.book.getUserBookingsBySubService({
          subServiceId: e,
          userId,
          status: BOOKING_STATUS.ACCEPTED,
        }),
      ),
    )

    if (userBookingsBySubServices.some((e) => e.length))
      throw new ForbiddenError('user has existing booking with service')

    const cardData = await repo.user.getCard({ userId })

    if (data.channel === CHANNEL.CARD && !cardData) {
      throw new ForbiddenError('user does not have an existing card')
    }
    if (
      cardData &&
      dayjs(cardData.expiryYear + cardData.expiryMonth).isBefore(new Date())
    ) {
      await repo.user.deleteCard({ cardId: cardData.cardId })
      throw new ForbiddenError('card expired')
    }

    if (data.code) {
      const promo = await repo.other.getPromoByCode(data.code)
      if (!promo || !promo.active)
        throw new ForbiddenError('promo code missing or inactive')

      const bookingWithPromo = await repo.other.getBookingByPromo(
        data.code,
        userId,
      )
      if (bookingWithPromo)
        throw new ForbiddenError('promo code has been used before')
    }

    const [distance, subServices] = await Promise.all([
      repo.pro.getDistBtwLoctions({
        latitude,
        longitude,
        proId,
      }),
      repo.book.getSubServices(data.subServiceIds),
    ])

    if (subServices.length !== data.subServiceIds.length)
      throw new NotFoundError('subService does not exist')

    const arrivalAt = getArrivalTime(distance)

    const booking = await repo.book.bookPro({
      ...data,
      distance,
      subServices: subServices.map((e) => ({
        subServiceFee: e.price,
        subServiceName: e.name,
        subServiceId: e.subServiceId,
      })),
      transportFee: getTransportPrice(distance),
      arrivalAt,
      samplePhotoOriginalFileName,
      samplePhotoKey,
      samplePhotoUrl,
      auto: true,
    })

    if (bookings.length < 1) {
      queue.notifyQueue.add({
        title: 'NewBooking',
        body: 'New booking has been received',
        userId: proId,
        type: 'booking',
      })
    }
    return booking
  }

const setBookingSubservices =
  ({ repo }: { repo: Repo }) =>
  async (data: {
    subServiceIds: number[]
    bookingId: number
    userId: number
  }) => {
    PatchAddServiceSchema.parse(data)

    const booking = await repo.book.getBookingByIdAndMore(data.bookingId)

    if (!booking || booking.userId !== data.userId)
      throw new NotFoundError('booking not found')

    if (
      booking.status !== BOOKING_STATUS.ACCEPTED &&
      booking.status !== BOOKING_STATUS.PENDING
    )
      throw new NotFoundError(
        `Service with ${booking.status} status can no longer be added to booking`,
      )

    const subServices = await repo.book.getSubServices(data.subServiceIds)
    if (subServices.length !== data.subServiceIds.length)
      throw new NotFoundError('service not found')

    //we need to NOT replace services incase price changes

    const add = subServices.filter(
      (e) =>
        !booking.bookedSubServices.find(
          (f) => f.subService.subServiceId === e.subServiceId,
        ),
    )

    const remove = booking.bookedSubServices
      .filter(
        (e) =>
          !subServices.find(
            (f) => f.subServiceId === e.subService.subServiceId,
          ),
      )
      .map((e) => e.subService.subServiceId)

    await repo.book.setBookingSubservices({
      add,
      remove,
      bookingId: data.bookingId,
      userId: data.userId,
    })
  }

const acceptBooking =
  ({ repo, queue }: { repo: Repo; queue: Queue }) =>
  async ({
    userId,
    bookingId,
    role,
  }: {
    bookingId: number
    userId: number
    role: Role
  }) => {
    PostAcceptBookingReqSchema.parse({ userId, bookingId })

    if (role !== ROLES.PRO)
      throw new ForbiddenError('Booking can only be accepted by pro')

    const [pendingBookings] = await Promise.all([
      repo.book.getProBookingsByStatus(userId, BOOKING_STATUS.PENDING),
      // repo.book.getProBookingsByStatus(userId, BOOKING_STATUS.ACCEPTED),
    ])

    // if (acceptedBookings.length > 1)
    //   throw new ForbiddenError('too many accepted bookings')

    const booking = pendingBookings.find(
      (booking) => booking.bookingId === bookingId,
    )

    if (!booking) throw new NotFoundError('booking not found')

    const pro = await repo.user.getUserById(userId)

    if (!pro) throw new ForbiddenError('pro not found')

    await repo.book.updateBooking(bookingId, {
      acceptedAt: new Date(),
      status: BOOKING_STATUS.ACCEPTED,
    })

    await socket.sendMessage({
      _message: {
        messageType: 'text',
        receiverId: booking.userId,
        message: `Thank you for booking Hairsap, I am ${pro.name} and I’m your Braider. You can consult with me before my arrival.`,
      },
      senderId: userId,
    })

    queue.notifyQueue.add({
      userId: booking.userId,
      title: 'Booking accepted',
      body: 'Booking has been accepted',
      bookingId: booking.bookingId,
      status: BOOKING_STATUS.ACCEPTED,
      type: 'booking',
    })

    queue.notifyQueue.add({
      userId: booking.proId,
      title: 'Pin this booking',
      body: 'Pin this booking',
      bookingId: booking.bookingId,
      status: BOOKING_STATUS.ACCEPTED,
      type: 'booking',
    })
  }

const cancelBooking =
  ({ repo, queue }: { repo: Repo; queue: Queue }) =>
  async ({
    userId,
    bookingId,
    role,
  }: {
    bookingId: number
    userId: number
    role: Role
  }) => {
    PostAcceptBookingReqSchema.parse({ userId, bookingId })

    if (role !== ROLES.USER)
      throw new ForbiddenError('Booking can only be accepted by pro')

    const booking = await repo.book.getBookingById(bookingId)

    if (!booking || booking.userId !== userId)
      throw new NotFoundError('booking not found')

    if (booking.status !== BOOKING_STATUS.PENDING)
      throw new NotFoundError('Booking cannot be cancelled')

    await repo.book.updateBooking(bookingId, {
      cancelledAt: new Date(),
      status: BOOKING_STATUS.CANCELLED,
    })

    deleteBullIds({ repo, queue })({
      otherId: booking.bookingId,
      type: BullIdType.PIN,
    })

    queue.notifyQueue.add({
      userId: booking.proId,
      title: 'Booking cancelled',
      body: 'Booking has been cancelled',
      bookingId: booking.bookingId,
      type: 'booking',
    })
  }

const rejectBooking =
  ({ repo, queue }: { repo: Repo; queue: Queue }) =>
  async ({ userId, bookingId }: { bookingId: number; userId: number }) => {
    PostAcceptBookingReqSchema.parse({ userId, bookingId })

    const booking = await repo.book.getBookingById(bookingId)

    if (!booking || booking.proId !== userId)
      throw new NotFoundError('booking not found')

    if (
      booking.status !== BOOKING_STATUS.PENDING &&
      booking.status !== BOOKING_STATUS.ACCEPTED
    )
      throw new ForbiddenError('Booking cannot be rejected')

    await repo.book.updateBooking(bookingId, {
      status: BOOKING_STATUS.REJECTED,
      rejectedAt: new Date(),
    })

    deleteBullIds({ repo, queue })({
      otherId: booking.bookingId,
      type: BullIdType.PIN,
    })

    queue.notifyQueue.add({
      userId: booking.userId,
      title: 'Booking rejected',
      body: 'Booking has been rejected',
      bookingId: booking.bookingId,
      status: BOOKING_STATUS.REJECTED,
      type: 'booking',
    })
  }

const resolveBonus = async ({
  repo,
  proId,
  queue,
}: {
  repo: Repo
  queue: Queue
  proId: number
}) => {
  const sentBonusNotification = await repo.other.getNotificationStatusByPeriod({
    userId: proId,
    period: 'week',
    type: 'bonus',
  })

  if (sentBonusNotification) return

  const total = await repo.book.getTotalOfWeeklyCompletedBookings(proId)
  if ((total._sum.price || 0) >= PERIODIC_CASH_AMOUNTS.WEEKLY_BONUS_QUOTA) {
    await Promise.all([
      repo.book.addBonus({ proId, amount: PERIODIC_CASH_AMOUNTS.WEEKLY_BONUS }),
      repo.other.addNotificationStatus({ type: 'bonus', userId: proId }),
    ])
    queue.notifyQueue.add({
      title: 'New Bonus',
      body: `You have earned a bonus of ${addCommas(
        PERIODIC_CASH_AMOUNTS.WEEKLY_BONUS / 100,
      )}`,
      userId: proId,
      type: 'general',
    })
  }
}

const redeemCash = async ({
  repo,
  queue,
  proId,
}: {
  repo: Repo
  queue: Queue
  proId: number
}) => {
  const sentRedeemCashNotification =
    await repo.other.getNotificationStatusByPeriod({
      userId: proId,
      period: 'day',
      type: 'redeem',
    })

  if (sentRedeemCashNotification) return

  const { total } = await repo.book.getUnredeemedCashPayments({
    proId,
  })

  if (total >= PERIODIC_CASH_AMOUNTS.DAILY_REDEEM_THRESHOLD) {
    await repo.other.addNotificationStatus({ type: 'redeem', userId: proId })
    queue.notifyQueue.add({
      title: 'Remit Payout Request',
      body: `Kindly remit payout of ${addCommas(
        total / 100,
      )} within the next 48 hours`,
      userId: proId,
      type: 'general',
    })
    queue.deactivateRedeem.add(
      {
        proId,
      },
      {
        delay: dayjs.duration({ days: 2 }).as('ms'),
      },
    )
  }
}

const notify100completed = async ({
  repo,
  queue,
  proId,
}: {
  repo: Repo
  queue: Queue
  proId: number
}) => {
  const proBookingCount = (await repo.book.getProbookingCount(proId)) >= 100

  if (!proBookingCount) return

  const completed100NotificationStatus = await repo.other.getNotificationStatus(
    {
      userId: proId,
      type: 'completed 100',
    },
  )

  if (completed100NotificationStatus) return

  repo.other.addNotificationStatus({
    userId: proId,
    type: 'completed 100',
  })
  queue.notifyQueue.add({
    title: '100 completed bookings',
    body: 'Your 50% and above returned booking ration has been activated',
    userId: proId,
    type: 'booking',
  })
}

const markBookingAsCompleted =
  ({ repo, queue }: { repo: Repo; queue: Queue }) =>
  async ({ proId, bookingId }: { bookingId: number; proId: number }) => {
    PostMarkBookingAsCompletedReqSchema.parse({ proId, bookingId })

    const booking = await repo.book.getBookingAndInvoiceById(bookingId)

    if (!booking || booking.proId !== proId)
      throw new NotFoundError('booking not found')

    const user = await repo.user.getUserAndCardById(booking.userId)
    if (!user) throw new NotFoundError('user not found')

    if (booking.status !== BOOKING_STATUS.ACCEPTED)
      throw new NotFoundError('Booking cannot be rejected')

    if (!booking.invoice?.channel) {
      logger.warn('invoice/channel not found for booking-' + bookingId)
      throw new InternalError()
    }

    let discount
    if (booking.invoice.promo?.promoId) {
      const promo = await repo.other.getPromoByCode(booking.invoice.promo.code)
      if (promo) discount = await repo.other.getDiscountById(promo.discountId)
    }

    const { total, promoAmount } = resolveAmount({
      invoice: booking.invoice.invoiceFees.reduce((acc, e) => acc + e.price, 0),
      transport: booking.invoice.transportFee,
      code: discount?.name,
      pinAmount: booking.pinAmount,
    })

    let bookingUpdate: Prisma.BookingUpdateInput = {
      status: BOOKING_STATUS.COMPLETED,
      completedAt: new Date(),
    }
    if (discount) {
      bookingUpdate = {
        ...bookingUpdate,
        invoice: {
          update: {
            promoUsed: !!discount,
            promoAmount,
          },
        },
      }
    }

    await repo.book.updateBooking(bookingId, bookingUpdate)

    await notify100completed({
      repo,
      proId,
      queue,
    })

    queue.notifyQueue.add({
      title: 'Booking completed',
      body: 'Booking has been completed',
      userId: proId,
      type: 'booking',
      status: BOOKING_STATUS.COMPLETED,
      bookingId: booking.bookingId,
    })

    queue.notifyQueue.add({
      title: 'Booking completed',
      body: 'Booking has been completed',
      userId: booking.userId,
      type: 'booking',
      status: BOOKING_STATUS.COMPLETED,
      bookingId: booking.bookingId,
    })

    await resolveBonus({ repo, queue, proId: booking.proId })

    if (booking.invoice.channel === CHANNEL.CASH) {
      await redeemCash({ repo, queue, proId: booking.proId })
    } else {
      if (!user.card?.authorizationCode) return
      if (!booking.invoice?.invoiceFees?.length) return

      let paymentError = false

      try {
        await got
          .post(PAYSTACK_URL + '/transaction/charge_authorization', {
            headers: {
              Authorization: 'Bearer ' + process.env.PAYMENT_SECRET,
            },
            json: {
              authorization_code: user.card.authorizationCode,
              email: user.email,
              amount: total,
              metadata: {
                invoiceId: booking.invoice.invoiceId,
                userId: booking.userId,
                custom_fields: booking.invoice.invoiceFees,
              },
            },
          })
          .json()

        await repo.book.updateBooking(bookingId, {
          invoice: {
            update: {
              paid: true,
            },
          },
        })
      } catch (error) {
        paymentError = true
        logger.err(error, 'payment unsuccessful')
      }

      if (paymentError) {
        queue.notifyQueue.add({
          title: 'Card payment unsuccessful please collect cash',
          body: `Card payment unsuccessful please collect amount of ${total}`,
          userId: proId,
          type: 'booking',
        })
        await repo.book.updateBooking(bookingId, {
          invoice: {
            update: {
              channel: CHANNEL.CASH,
            },
          },
        })
        throw new ForbiddenError('payment unsuccessful')
      }
    }
  }

const markBookingAsArrived =
  ({ repo, queue }: { repo: Repo; queue: Queue }) =>
  async ({ proId, bookingId }: { bookingId: number; proId: number }) => {
    PostMarkBookingAsArrivedReqSchema.parse({ proId, bookingId })

    const booking = await repo.book.getBookingById(bookingId)

    if (!booking || booking.proId !== proId)
      throw new NotFoundError('booking not found')

    if (booking.status !== BOOKING_STATUS.ACCEPTED)
      throw new NotFoundError('Booking has not been accepted')

    if (booking.arrived)
      throw new ForbiddenError('booking already marked as arrived')
    else
      await repo.book.updateBooking(bookingId, {
        arrived: true,
      })

    queue.notifyQueue.add({
      userId: booking.userId,
      title: 'Beauty Pro has arrived',
      body: 'Beauty Pro has arrived',
      status: 'arrived',
      bookingId: booking.bookingId,
      type: 'booking',
    })
  }

const markBookingAsIntransit =
  ({ repo, queue }: { repo: Repo; queue: Queue }) =>
  async (body: { bookingId: number; proId: number }) => {
    z.object({
      bookingId: z.number(),
      proId: z.number(),
    })
      .strict()
      .parse(body)

    const { bookingId, proId } = body

    const booking = await repo.book.getBookingById(bookingId)
    if (!booking || booking.proId !== proId)
      throw new NotFoundError('booking not found')

    if (booking.status !== BOOKING_STATUS.ACCEPTED)
      throw new NotFoundError('Booking has not been accepted')

    if (booking.inTransit)
      throw new ForbiddenError('booking already marked as intransit')

    await repo.book.updateBooking(bookingId, {
      inTransit: true,
    })

    queue.notifyQueue.add({
      userId: booking.userId,
      title: 'Prep for pro arrival',
      body: 'Kindly provide an electrical outlet. Remove pets or baby around the vicinity before the pro arrives',
      type: 'booking',
      status: 'in transit',
    })
  }

const getAcceptedBookings =
  ({ repo }: { repo: Repo }) =>
  async ({ userId }: { userId: number }) => {
    GetAcceptedBookingsReqSchema.parse({ userId })

    const acceptedBookings = await repo.book.getBookingsByStatusAndMore(
      userId,
      [BOOKING_STATUS.ACCEPTED],
    )

    return acceptedBookings
  }

const getMissedBookings =
  ({ repo }: { repo: Repo }) =>
  async ({ proId }: { proId: number }) => {
    z.object({
      proId: z.number(),
    })
      .strict()
      .merge(CursorSchema)
      .parse({ proId })

    const missedBookings = await repo.book.getMissedBookings({ proId })

    return missedBookings
  }

const getBookingActivity =
  ({ repo }: { repo: Repo }) =>
  async ({ userId }: { userId: number }) => {
    z.object({ userId: z.number() }).strict().parse({ userId })

    const bookingActivities = await repo.book.getBookingActivity({
      userId,
    })

    return bookingActivities.map((ba) => computeBookingTotal(ba))
  }

const getUserBookings =
  ({ repo }: { repo: Repo }) =>
  async (body: GetUserBookingsReq) => {
    GetUserBookingsReqSchema.parse(body)

    const { page, perPage } = body

    const _page = paginate({ page, perPage })
    const [total, data] = await repo.book.getUserBookings(body.userId, _page)

    const meta = getPageMeta({
      ..._page,
      total,
    })

    return { meta, data }
  }

const getProBookings =
  ({ repo }: { repo: Repo }) =>
  async (body: GetProBookingsReq) => {
    GetProBookingsReqSchema.parse(body)

    const data = await repo.book.getProBookings(body)

    return data
  }

const rateAndReviewBooking =
  ({ repo }: { repo: Repo }) =>
  async (body: PostRateBookingReq) => {
    PostRateBookingReqSchema.parse(body)

    const { bookingId, userId, rating, review } = body
    const booking = await repo.book.getBookingById(bookingId)
    if (!booking || booking.userId !== userId)
      throw new NotFoundError('booking not found')

    if (booking.status !== BOOKING_STATUS.COMPLETED)
      throw new ForbiddenError('Booking has not been completed')

    if (typeof booking.rating === 'number')
      throw new ForbiddenError('Booking has already been rated')

    await repo.book.updateBooking(bookingId, {
      rating,
      review: filterBadWords(review),
    })
  }

const getTransactions =
  ({ repo }: { repo: Repo }) =>
  async (body: { userId: number }) => {
    z.object({ userId: z.number() }).strict().parse(body)

    const { userId } = body

    const data = await repo.book.getTransactions(userId)

    return data
  }

const getUnpaidBonuses =
  ({ repo }: { repo: Repo }) =>
  async () => {
    const data = await repo.book.getUnpaidBonuses()

    return { data }
  }

const markBonusAsPaid =
  ({ repo }: { repo: Repo }) =>
  async ({ bonusId }: { bonusId: number }) => {
    const bonus = await repo.book.getBonusById(bonusId)

    if (!bonus) throw new NotFoundError('booking not found')

    if (bonus.paid === true)
      throw new ForbiddenError('Bonus has already been marked as paid')

    await repo.book.updateBonus(bonusId, {
      paid: true,
    })
  }

const getBookingById =
  ({ repo }: { repo: Repo }) =>
  async ({ bookingId }: { bookingId: number }) => {
    z.object({ bookingId: z.number() }).strict().parse({ bookingId })
    const booking = await repo.book.getBookingByIdAndMore(bookingId)
    if (booking) return computeBookingTotal(booking)
    return
  }

const pinBooking =
  ({ repo, queue }: { repo: Repo; queue: Queue }) =>
  async ({
    bookingId,
    proId,
    date,
  }: {
    bookingId: number
    proId: number
    date: string
  }) => {
    z.object({
      bookingId: z.number(),
      proId: z.number(),
      date: z.string().datetime(),
    })
      .strict()
      .parse({ bookingId, proId, date })
    const booking = await repo.book.getBookingByIdAndMore(bookingId)
    if (!booking || booking.proId !== proId)
      throw new NotFoundError('Booking not found')
    if (booking.status !== BOOKING_STATUS.ACCEPTED)
      throw new ForbiddenError('This booking has not been accepted')
    if (booking.pinStatus) {
      throw new ForbiddenError('This booking has been previously pinned')
    }
    // if (dayjs(date).isAfter(dayjs().add(7, 'days'))) {
    //   throw new ForbiddenError('Please pick a date less than 7 days from now')
    // }

    const _booking = await repo.book.updateBooking(bookingId, {
      pinStatus: PIN_STATUS.PENDING,
      pinDate: date,
    })

    queue.notifyQueue.add({
      userId: booking.userId,
      title: 'Pin created',
      body: `Your pin has been created, kindly make a deposit of ${addCommas(
        PIN_AMOUNT / 100,
      )} to the pro to complete this pinning, this amount is deducted from your total service fee upon completion of your appointment`,
      type: 'booking',
      status: 'create pin',
    })

    return _booking
  }

const acceptPinnedBooking =
  ({ repo, queue }: { repo: Repo; queue: Queue }) =>
  async ({ bookingId, userId }: { bookingId: number; userId: number }) => {
    z.object({
      bookingId: z.number(),
      userId: z.number(),
    })
      .strict()
      .parse({ bookingId, userId })
    const booking = await repo.book.getBookingByIdAndMore(bookingId)
    if (!booking || booking.userId !== userId)
      throw new NotFoundError('booking not found')
    if (booking.pinStatus !== PIN_STATUS.PENDING) {
      throw new ForbiddenError(
        'The pin status for this booking is invalid for the operation',
      )
    }
    if (dayjs().isAfter(dayjs(booking.pinDate))) {
      throw new ForbiddenError(
        'The scheduled pin date for this booking has expired',
      )
    }

    const _booking = await repo.book.updateBooking(bookingId, {
      pinStatus: PIN_STATUS.ACCEPTED,
    })

    queue.notifyQueue.add({
      userId: booking.userId,
      title: 'Your pin has been accepted',
      body: `Your pin has been accepted, kindly make a deposit of ${addCommas(
        PIN_AMOUNT / 100,
      )} to the pro to complete this pinning, this amount is deducted from your total service fee upon completion of your appointment`,
      type: 'booking',
      status: 'accept pin',
    })
    queue.notifyQueue.add({
      userId: booking.proId,
      title: 'Pin accepted',
      body: `Click Paid if you’ve received a deposit of ${addCommas(
        PIN_AMOUNT / 100,
      )}`,
      type: 'booking',
      status: 'request pin',
    })

    //setup seven day notification cron

    return _booking
  }

const deleteBullIds =
  ({ repo, queue }: { repo: Repo; queue: Queue }) =>
  async (data: { otherId: number; type: BullIdType }) => {
    try {
      const bullIds = await repo.other.getBullIds(data)

      if (!bullIds.length) return

      bullIds.forEach((e) => queue.notifyQueue.removeRepeatableByKey(e.jobId))

      await repo.other.deleteBullIds({
        jobId: { in: bullIds.map((e) => e.jobId) },
      })
    } catch (error) {
      logger.err(error, 'error deleting bullids')
    }
  }

const rejectPinnedBooking =
  ({ repo, queue }: { repo: Repo; queue: Queue }) =>
  async ({ bookingId, proId }: { bookingId: number; proId: number }) => {
    z.object({
      bookingId: z.number(),
      proId: z.number(),
    })
      .strict()
      .parse({ bookingId, proId })
    const booking = await repo.book.getBookingByIdAndMore(bookingId)
    if (!booking || booking.proId !== proId)
      throw new NotFoundError('booking not found')
    if (
      booking.pinStatus === PIN_STATUS.CANCELLED ||
      booking.pinStatus === PIN_STATUS.REJECTED
    ) {
      throw new ForbiddenError(
        'The pin status for this booking is invalid for the operation',
      )
    }
    if (dayjs().isAfter(dayjs(booking.pinDate))) {
      throw new ForbiddenError(
        'The scheduled pin date for this booking has expired',
      )
    }

    const _booking = await repo.book.updateBooking(bookingId, {
      pinStatus: PIN_STATUS.REJECTED,
    })

    deleteBullIds({ repo, queue })({
      otherId: booking.bookingId,
      type: BullIdType.PIN,
    })

    queue.notifyQueue.add({
      userId: booking.userId,
      title: 'You pin has been rejected',
      body: 'Your pin has been rejected',
      type: 'booking',
      status: 'reject pin',
    })

    return _booking
  }

const cancelPinnedBooking =
  ({ repo, queue }: { repo: Repo; queue: Queue }) =>
  async ({ bookingId, userId }: { bookingId: number; userId: number }) => {
    z.object({
      bookingId: z.number(),
      userId: z.number(),
    })
      .strict()
      .parse({ bookingId, userId })
    const booking = await repo.book.getBookingByIdAndMore(bookingId)
    if (!booking || booking.userId !== userId)
      throw new NotFoundError('booking not found')
    if (
      booking.pinStatus === PIN_STATUS.CANCELLED ||
      booking.pinStatus === PIN_STATUS.REJECTED
    ) {
      throw new ForbiddenError(
        'The pin status for this booking is invalid for the operation',
      )
    }
    if (dayjs().isAfter(dayjs(booking.pinDate))) {
      throw new ForbiddenError(
        'The scheduled pin date for this booking has expired',
      )
    }

    const _booking = await repo.book.updateBooking(bookingId, {
      pinStatus: PIN_STATUS.CANCELLED,
    })

    deleteBullIds({ repo, queue })({
      otherId: booking.bookingId,
      type: BullIdType.PIN,
    })

    queue.notifyQueue.add({
      userId: booking.proId,
      title: 'User has cancelled pin',
      body: 'User has cancelled pin',
      type: 'booking',
      status: 'cancel pin',
    })

    return _booking
  }

const markPinnedBookingAsPaid =
  ({ repo, queue }: { repo: Repo; queue: Queue }) =>
  async ({ bookingId, proId }: { bookingId: number; proId: number }) => {
    z.object({
      bookingId: z.number(),
      proId: z.number(),
    })
      .strict()
      .parse({ bookingId, proId })
    const booking = await repo.book.getBookingByIdAndMore(bookingId)
    if (!booking || booking.proId !== proId)
      throw new NotFoundError('booking not found')
    if (booking.pinStatus !== PIN_STATUS.ACCEPTED) {
      throw new ForbiddenError(
        'The pin status for this booking is invalid for the operation',
      )
    }
    if (dayjs().isAfter(dayjs(booking.pinDate))) {
      throw new ForbiddenError(
        'The scheduled pin date for this booking has expired',
      )
    }

    const _booking = await repo.book.updateBooking(bookingId, {
      pinStatus: PIN_STATUS.PAID,
      pinAmount: PIN_AMOUNT,
    })

    queue.notifyQueue.add({
      userId: booking.proId,
      title: `Customer has made payment`,
      body: `This customer ${booking.user.name} has made payment`,
      type: 'booking',
      status: 'paid pin',
    })

    const pinDate = dayjs(booking.pinDate)

    const pinHour = pinDate.subtract(1, 'h').get('h')

    const repeat: Bull.JobOptions['repeat'] = {
      // limit: 7,
      endDate: pinDate.toISOString(),
      cron: `* ${pinHour} * * *`, //every day by 1 hour to the meeting
    }

    const oneHourBeforeSchedule = pinDate.subtract(1, 'hour')
    const oneDayBeforeSchedule = oneHourBeforeSchedule.subtract(1, 'day')

    const day = pinDate.format('Do')
    const month = pinDate.format('MMMM')
    const year = pinDate.format('YYYY')
    const time = pinDate.format('h:ma')

    const notifications = []

    notifications.push(
      queue.notifyQueue.add(
        {
          userId: booking.userId,
          title: 'Reminder for your pinned booking',
          body: `This is to remind you that your pinned booking is on the ${day} of ${month} ${year} by ${time}`,
          type: 'booking',
          status: 'pin reminder',
        },
        {
          repeat,
          jobId: uniqueId(),
        },
      ),
    )

    if (dayjs().isBefore(oneHourBeforeSchedule)) {
      notifications.push(
        queue.notifyQueue.add(
          {
            userId: booking.proId,
            title: 'Reminder for your pinned booking',
            body: `This is to remind you that your accepted pinned booking for ${booking.bookedSubServices.join()} by ${
              booking.user.name
            } is on the ${day} of ${month} ${year} by ${time}`,
            type: 'booking',
            status: 'pin reminder',
          },
          {
            delay: oneHourBeforeSchedule.diff(dayjs()),
            jobId: uniqueId(),
          },
        ),
      )
    }

    if (dayjs().isBefore(oneDayBeforeSchedule)) {
      notifications.push(
        queue.notifyQueue.add(
          {
            userId: booking.proId,
            title: 'Reminder for your pinned booking',
            body: `This is to remind you that your accepted pinned booking for ${booking.bookedSubServices.join()} by ${
              booking.user.name
            } is on the ${day} of ${month} ${year} by ${time}`,
            type: 'booking',
            status: 'pin reminder',
          },
          {
            delay: oneDayBeforeSchedule.diff(dayjs()),
            jobId: uniqueId(),
          },
        ),
      )
    }

    const resolvedNotifications = await Promise.allSettled(notifications)

    type QueueType = Awaited<typeof notifications[0]>

    const ids = (
      resolvedNotifications.filter(
        (e) => e.status === 'fulfilled',
      ) as PromiseFulfilledResult<QueueType>[]
    ).map((e) => (e.value.opts.repeat as any)?.key as string)

    await repo.other.addBullIds(
      ids.map((e) => ({
        jobId: e,
        otherId: booking.bookingId,
        type: BullIdType.PIN,
      })),
    )

    return _booking
  }

const makeBook = ({ repo, queue }: { repo: Repo; queue: Queue }) => {
  return {
    bookPro: bookPro({ repo, queue }),
    setBookingSubservices: setBookingSubservices({ repo }),
    acceptBooking: acceptBooking({ repo, queue }),
    rejectBooking: rejectBooking({ repo, queue }),
    getAcceptedBookings: getAcceptedBookings({ repo }),
    getMissedBookings: getMissedBookings({ repo }),
    cancelBooking: cancelBooking({ repo, queue }),
    markBookingAsCompleted: markBookingAsCompleted({ repo, queue }),
    markBookingAsArrived: markBookingAsArrived({ repo, queue }),
    getBookingActivity: getBookingActivity({ repo }),
    getUserBookings: getUserBookings({ repo }),
    getProBookings: getProBookings({ repo }),
    markBookingAsIntransit: markBookingAsIntransit({ repo, queue }),
    rateAndReviewBooking: rateAndReviewBooking({ repo }),
    getTransactions: getTransactions({ repo }),
    getUnpaidBonuses: getUnpaidBonuses({ repo }),
    markBonusAsPaid: markBonusAsPaid({ repo }),
    getBookingById: getBookingById({ repo }),
    autoBook: autoBook({ repo, queue }),
    manualBook: manualBook({ repo, queue }),
    pinBooking: pinBooking({ repo, queue }),
    acceptPinnedBooking: acceptPinnedBooking({ repo, queue }),
    rejectPinnedBooking: rejectPinnedBooking({ repo, queue }),
    markPinnedBookingAsPaid: markPinnedBookingAsPaid({ repo, queue }),
    cancelPinnedBooking: cancelPinnedBooking({ repo, queue }),
  }
}

export default makeBook
