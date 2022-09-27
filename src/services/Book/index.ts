import got from 'got-cjs'
import { z } from 'zod'
import {
  PERIODIC_CASH_AMOUNTS,
  BOOKING_STATUS,
  CHANNEL,
  PAYSTACK_URL,
  ROLES,
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
} from '../../utils'
import { ForbiddenError, InternalError, NotFoundError } from '../../utils/Error'
import { Queue } from '../Queue'

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
    subServiceId: number
    userId: number
    proId: number
    address: string
    samplePhotoOriginalFileName?: string
    samplePhotoKey?: string
    samplePhotoUrl?: string
    channel: Channel
  }) => {
    const { longitude, latitude, proId, userId } = data

    PostBookProReqSchema.parse(data)

    const pro = await repo.user.getUserById(data.proId)

    if (!pro?.available) throw new ForbiddenError('Pro is not available')

    const bookings = await repo.book.getProBookingsByStatus(
      proId,
      BOOKING_STATUS.ACCEPTED,
    )

    if (bookings.length > 1) throw new ForbiddenError('pro currently busy')

    const userBookingsBySubService =
      await repo.book.getUserBookingsBySubService({
        subServiceId: data.subServiceId,
        userId,
        status: BOOKING_STATUS.ACCEPTED,
      })

    if (userBookingsBySubService.length)
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

    const [distance, subService] = await Promise.all([
      repo.pro.getDistBtwLoctions({
        latitude,
        longitude,
        proId,
      }),
      repo.book.getSubService(data.subServiceId),
    ])

    if (!subService) throw new NotFoundError('subService does not exist')

    const arrivalAt = getArrivalTime(distance)

    const booking = await repo.book.bookPro({
      ...data,
      distance,
      subServiceFee: subService.price,
      subServiceName: subService.name,
      transportFee: getTransportPrice(distance),
      arrivalAt,
      samplePhotoOriginalFileName,
      samplePhotoKey,
      samplePhotoUrl,
    })

    queue.notifyQueue.add({
      title: 'NewBooking',
      body: 'New booking has been received',
      userId: proId,
    })

    return booking
  }

const addServiceToBooking =
  ({ repo }: { repo: Repo }) =>
  async (data: { subServiceId: number; bookingId: number; userId: number }) => {
    PatchAddServiceSchema.parse(data)

    const booking = await repo.book.getBookingById(data.bookingId)

    if (!booking || booking.userId !== data.userId)
      throw new NotFoundError('booking not found')

    if (
      booking.status !== BOOKING_STATUS.ACCEPTED &&
      booking.status !== BOOKING_STATUS.PENDING
    )
      throw new NotFoundError('Service can no longer be added to booking')

    const subService = await repo.book.getSubService(data.subServiceId)
    if (!subService) throw new NotFoundError('service not found')

    await repo.book.addServiceToBooking({
      subService,
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

    const [pendingBookings, acceptedBookings] = await Promise.all([
      repo.book.getProBookingsByStatus(userId, BOOKING_STATUS.PENDING),
      repo.book.getProBookingsByStatus(userId, BOOKING_STATUS.ACCEPTED),
    ])

    if (acceptedBookings.length > 1)
      throw new ForbiddenError('too many accepted bookings')

    const booking = pendingBookings.find(
      (booking) => booking.bookingId === bookingId,
    )

    if (!booking) throw new NotFoundError('booking not found')

    await repo.book.updateBooking(bookingId, {
      acceptedAt: new Date(),
      status: BOOKING_STATUS.ACCEPTED,
    })

    queue.notifyQueue.add({
      userId: booking.userId,
      title: 'Booking accepted',
      body: 'Booking has been accepted',
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

    queue.notifyQueue.add({
      userId: booking.proId,
      title: 'Booking cancelled',
      body: 'Booking has been cancelled',
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

    queue.notifyQueue.add({
      userId: booking.userId,
      title: 'Booking rejected',
      body: 'Booking has been rejected',
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
  const sentBonusNotification = await repo.other.getNotificationStatus({
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
      body: `You have earned a bonus of ${
        PERIODIC_CASH_AMOUNTS.WEEKLY_BONUS / 100
      }`,
      userId: proId,
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
  const sentRedeemCashNotification = await repo.other.getNotificationStatus({
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
      title: 'Redeem Payout Request',
      body: `Kindly redeem payout of ${total / 100} within the next 48 hours`,
      userId: proId,
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

    await repo.book.updateBooking(bookingId, {
      status: BOOKING_STATUS.COMPLETED,
    })

    await resolveBonus({ repo, queue, proId: booking.proId })

    if (booking.invoice.channel === CHANNEL.CASH) {
      await redeemCash({ repo, queue, proId: booking.proId })
    } else {
      if (!user.card?.authorizationCode) return
      if (!booking.invoice?.invoiceFees?.length) return

      const amount = booking.invoice.invoiceFees.reduce(
        (acc, e) => acc + e.price,
        0,
      )

      try {
        await got
          .post(PAYSTACK_URL + '/transaction/charge_authorization', {
            headers: {
              Authorization: 'Bearer ' + process.env.PAYMENT_SECRET,
            },
            json: {
              authorization_code: user.card.authorizationCode,
              email: user.email,
              amount,
              metadata: {
                invoiceId: booking.invoice.invoiceId,
                userId: booking.userId,
                custom_fields: booking.invoice.invoiceFees,
              },
            },
          })
          .json()
      } catch (error) {
        // TODO: handle failed payments
        logger.info({ userId: user.userId }, 'payment unsuccessful')
        throw new InternalError('payment unsuccessful')
      }
    }
  }

const markBookingAsArrived =
  ({ repo }: { repo: Repo }) =>
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
    })
  }

const getAcceptedProBookings =
  ({ repo }: { repo: Repo }) =>
  async ({ userId }: { userId: number }) => {
    GetAcceptedBookingsReqSchema.parse({ userId })

    const acceptedBookings = await repo.book.getProBookingsByStatus(
      userId,
      BOOKING_STATUS.ACCEPTED,
    )

    return acceptedBookings
  }

const getBookingActivity =
  ({ repo }: { repo: Repo }) =>
  async ({ userId }: { userId: number }) => {
    z.object({ userId: z.number() }).strict().parse({ userId })

    const bookingActivities = await repo.book.getBookingActivity(userId)

    return bookingActivities
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
      throw new NotFoundError('Booking has not been completed')

    if (typeof booking.rating === 'number')
      throw new NotFoundError('Booking has already been rated')

    await repo.book.updateBooking(bookingId, {
      rating,
      review,
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
  ({ bookingId }: { bookingId: number }) => {
    z.object({ bookingId: z.number() }).strict().parse({ bookingId })
    return repo.book.getBookingById(bookingId)
  }

const makeBook = ({ repo, queue }: { repo: Repo; queue: Queue }) => {
  return {
    bookPro: bookPro({ repo, queue }),
    addServiceToBooking: addServiceToBooking({ repo }),
    acceptBooking: acceptBooking({ repo, queue }),
    rejectBooking: rejectBooking({ repo, queue }),
    getAcceptedProBookings: getAcceptedProBookings({ repo }),
    cancelBooking: cancelBooking({ repo, queue }),
    markBookingAsCompleted: markBookingAsCompleted({ repo, queue }),
    markBookingAsArrived: markBookingAsArrived({ repo }),
    getBookingActivity: getBookingActivity({ repo }),
    getUserBookings: getUserBookings({ repo }),
    getProBookings: getProBookings({ repo }),
    markBookingAsIntransit: markBookingAsIntransit({ repo, queue }),
    rateAndReviewBooking: rateAndReviewBooking({ repo }),
    getTransactions: getTransactions({ repo }),
    getUnpaidBonuses: getUnpaidBonuses({ repo }),
    markBonusAsPaid: markBonusAsPaid({ repo }),
    getBookingById: getBookingById({ repo }),
  }
}

export default makeBook
