import { BOOKING_STATUS, ROLES } from '../../config/constants'
import { GetAcceptedBookingsReqSchema } from '../../schemas/request/getPendingBookingsSchema'
import { PatchAddServiceSchema } from '../../schemas/request/patchAddService'
import { PostAcceptBookingReqSchema } from '../../schemas/request/postAcceptBooking'
import { PostBookProReqSchema } from '../../schemas/request/postBookPro'
import type { Repo, Role } from '../../types'
import { getTransportPrice } from '../../utils'
import { ForbiddenError, NotFoundError } from '../../utils/Error'

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
      transportFee: getTransportPrice(distance),
    })

    //TODO: send fmq

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
    })
  }

const acceptBooking =
  ({ repo }: { repo: Repo }) =>
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

    const pendingBookings = await repo.book.getProBookingsByStatus(
      userId,
      BOOKING_STATUS.PENDING,
    )

    const booking = pendingBookings.find(
      (booking) => booking.bookingId === bookingId,
    )

    if (!booking || booking.proId !== userId)
      throw new NotFoundError('booking not found')

    if (booking.status !== BOOKING_STATUS.PENDING)
      throw new NotFoundError('Booking cannot be accepted')

    if (pendingBookings.length > 1)
      throw new ForbiddenError('Too many pending bookings')

    await repo.book.updateBooking(bookingId, {
      acceptedAt: new Date(),
      status: BOOKING_STATUS.ACCEPTED,
    })
  }

const cancelBooking =
  ({ repo }: { repo: Repo }) =>
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
  }

const rejectBooking =
  ({ repo }: { repo: Repo }) =>
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
      throw new ForbiddenError('Booking can only be rejected by pro')

    const booking = await repo.book.getBookingById(bookingId)

    if (!booking || booking.userId !== userId)
      throw new NotFoundError('booking not found')

    if (booking.status !== BOOKING_STATUS.PENDING)
      throw new NotFoundError('Booking cannot be rejected')

    await repo.book.updateBooking(bookingId, {
      status: BOOKING_STATUS.REJECTED,
      rejectedAt: new Date(),
    })
  }

const markBookingAsCompleted =
  ({ repo }: { repo: Repo }) =>
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

    if (!(ROLES.PRO, ROLES.USER).includes(role))
      throw new ForbiddenError('Oly pro and user can mark booking as completed')

    const booking = await repo.book.getBookingById(bookingId)

    if (!booking || booking.userId !== userId)
      throw new NotFoundError('booking not found')

    if (booking.status !== BOOKING_STATUS.ACCEPTED)
      throw new NotFoundError('Booking cannot be rejected')

    if (role === ROLES.PRO && booking.proCompleted)
      throw new ForbiddenError('booking already marked as completed')
    else
      await repo.book.updateBooking(bookingId, {
        proCompleted: true,
        status: booking.userCompleted ? BOOKING_STATUS.COMPLETED : undefined,
      })

    if (role === ROLES.ADMIN && booking.userCompleted)
      throw new ForbiddenError('booking already marked as completed')
    else
      await repo.book.updateBooking(bookingId, {
        userCompleted: true,
        status: booking.proCompleted ? BOOKING_STATUS.COMPLETED : undefined,
      })

    //TODO: trigger payment
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

const makeBook = ({ repo }: { repo: Repo }) => {
  return {
    bookPro: bookPro({ repo }),
    addServiceToBooking: addServiceToBooking({ repo }),
    acceptBooking: acceptBooking({ repo }),
    rejectBooking: rejectBooking({ repo }),
    getAcceptedProBookings: getAcceptedProBookings({ repo }),
    cancelBooking: cancelBooking({ repo }),
    markBookingAsCompleted: markBookingAsCompleted({ repo }),
  }
}

export default makeBook
