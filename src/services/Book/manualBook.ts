import { BOOKING_STATUS, CHANNEL } from '../../config/constants'
import { Repo } from '../../types'
import { ForbiddenError, NotFoundError } from '../../utils/Error'
import { dayjs, getArrivalTime, getTransportPrice } from '../../utils'
import { Queue } from '../Queue'
import {
  PostManualBookReq,
  PostManualBookReqSchema,
} from '../../schemas/request/postManualBook'

export const manualBook =
  ({ repo, queue }: { repo: Repo; queue: Queue }) =>
  async (data: PostManualBookReq) => {
    PostManualBookReqSchema.parse(data)

    const subServices = await repo.book.getSubServices(data.subServiceIds)
    if (subServices.length !== data.subServiceIds.length)
      throw new NotFoundError('subService not found')

    const { longitude, latitude, userId, proId } = data

    const pro = await repo.user.getUserById(proId)

    if (!pro?.available) throw new ForbiddenError('Pro is not available')

    // const bookings = await repo.book.getProBookingsByStatus(
    //   proId,
    //   BOOKING_STATUS.ACCEPTED,
    // )

    // if (bookings.length >= 5) {
    //   return {}
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

    const distance = await repo.pro.getDistBtwLoctions({
      latitude,
      longitude,
      proId,
    })

    if (!distance) throw new ForbiddenError('pro has not set location')

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

    queue.notifyQueue.add({
      title: 'NewBooking',
      body: 'New booking has been received',
      userId: proId,
      type: 'booking',
    })

    return booking
  }
