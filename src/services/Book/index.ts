import { BOOKING_STATUS } from '../../config/constants'
import { PatchAddServiceSchema } from '../../schemas/request/patchAddService'
import { PostBookProReqSchema } from '../../schemas/request/postBookPro'
import type { Repo } from '../../types'
import { getTransportPrice } from '../../utils'
import { NotFoundError } from '../../utils/Error'

const bookPro =
  ({ repo }: { repo: Repo }) =>
  async ({
    longitude,
    latitude,
    ...data
  }: {
    longitude: number
    latitude: number
    subServiceId: number
    userId: number
    proId: number
    address: string
  }) => {
    PostBookProReqSchema.parse(data)

    const [distance, subService] = await Promise.all([
      repo.pro.getDistBtwLoctions({
        latitude,
        longitude,
        proId: data.proId,
      }),
      repo.book.getSubService(data.subServiceId),
    ])

    if (!subService) throw new NotFoundError('subService does not exist')

    const booking = await repo.book.bookPro({
      ...data,
      distance,
      subServiceFee: subService.price,
      subServiceName: subService.name,
      transportFee: getTransportPrice(distance!),
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
    if (booking.status !== BOOKING_STATUS.ACCEPTED)
      throw new NotFoundError('Service can no longer be added to booking')

    const subService = await repo.book.getSubService(data.subServiceId)
    if (!subService) throw new NotFoundError('service not found')

    await repo.book.addServiceToBooking({
      subService,
      bookingId: data.bookingId,
    })
  }

const makeBook = ({ repo }: { repo: Repo }) => {
  return {
    bookPro: bookPro({ repo }),
    addServiceToBooking: addServiceToBooking({ repo }),
  }
}

export default makeBook
