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

    const subService = await repo.other.getSubServiceById(data.subServiceId)
    if (!subService) throw new NotFoundError('subService not found')

    const { serviceId, price } = subService

    const { longitude, latitude, userId, proId } = data

    const pro = await repo.user.getUserById(proId)

    if (!pro?.available) throw new ForbiddenError('Pro is not available')

    const bookings = await repo.book.getProBookingsByStatus(
      proId,
      BOOKING_STATUS.ACCEPTED,
    )

    if (bookings.length >= 5) {
      return {}
      throw new ForbiddenError('pro currently busy')
    }

    const acceptedUserBookingsBySubService =
      await repo.book.getUserBookingsByService({
        serviceId,
        userId,
        status: BOOKING_STATUS.ACCEPTED,
      })

    if (acceptedUserBookingsBySubService.length)
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

    const distance = await repo.pro.getDistBtwLoctions({
      latitude,
      longitude,
      proId,
    })

    const arrivalAt = getArrivalTime(distance)
    const transportation = getTransportPrice(distance)

    const booking = await repo.book.bookPro({
      ...data,
      proId,
      distance,
      subServiceFee: subService.price,
      subServiceName: subService.name,
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
    return {
      ...booking,
      total: price + transportation,
    }
  }
