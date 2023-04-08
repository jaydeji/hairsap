import { BOOKING_STATUS, CHANNEL } from '../../config/constants'
import {
  PostAutoBookReq,
  PostAutoBookReqSchema,
} from '../../schemas/request/postAutoBook'
import { Repo } from '../../types'
import { ForbiddenError, NotFoundError } from '../../utils/Error'
import { dayjs, getArrivalTime, getTransportPrice } from '../../utils'
import { Queue } from '../Queue'

export const autoBook =
  ({ repo, queue }: { repo: Repo; queue: Queue }) =>
  async (data: PostAutoBookReq) => {
    PostAutoBookReqSchema.parse(data)

    const subServices = await repo.book.getSubServices(data.subServiceIds)
    if (subServices.length !== data.subServiceIds.length)
      throw new NotFoundError('subService not found')

    const {
      longitude,
      latitude,
      userId,
      distance: _distance,
      subServiceIds,
      lastProId,
    } = data

    const nearestPro = await repo.pro.getNearestPro({
      latitude,
      longitude,
      subServiceId: subServiceIds[0],
      distance: _distance,
      userId: lastProId,
    })

    if (!nearestPro) return

    const { distance, userId: proId } = nearestPro

    const bookings = await repo.book.getProBookingsByStatus(
      proId,
      BOOKING_STATUS.ACCEPTED,
    )

    // if (bookings.length >= 5) {
    //   return
    //   throw new ForbiddenError('pro currently busy')
    // }

    const acceptedUserBookingsBySubServices = await Promise.all(
      data.subServiceIds.map((e) =>
        repo.book.getUserBookingsBySubService({
          subServiceId: e,
          userId,
          status: BOOKING_STATUS.ACCEPTED,
        }),
      ),
    )
    if (acceptedUserBookingsBySubServices.some((e) => e.length))
      throw new ForbiddenError('user has existing booking with service')

    // const pendingUserBooking =
    //   await repo.book.getPendingUserBookingByServiceAndRange({
    //     serviceId,
    //     userId,
    //   })

    // if (pendingUserBooking)
    //   throw new ForbiddenError(
    //     'please wait a few minutes for booking to be accepted',
    //   )

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
      if (bookingWithPromo?.promoUsed)
        throw new ForbiddenError('promo code has been used before')
    }

    const arrivalAt = getArrivalTime(distance)

    const booking = await repo.book.bookPro({
      ...data,
      proId,
      distance,
      subServices: subServices.map((e) => ({
        subServiceFee: e.price,
        subServiceName: e.name,
        subServiceId: e.subServiceId,
      })),
      transportFee: getTransportPrice(distance),
      arrivalAt,
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
