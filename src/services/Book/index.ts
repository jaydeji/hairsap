import { z } from 'zod'
import { BOOKING_STATUS, ROLES } from '../../config/constants'
import { GetAcceptedBookingsReqSchema } from '../../schemas/request/getPendingBookingsSchema'
import { PatchAddServiceSchema } from '../../schemas/request/patchAddService'
import { PostAcceptBookingReqSchema } from '../../schemas/request/postAcceptBooking'
import { PostBookProReqSchema } from '../../schemas/request/postBookPro'
import { PostMarkBookingAsArrivedReqSchema } from '../../schemas/request/postMarkBookingAsArrived'
import {
  PostMarkBookingAsProCompletedReqSchema,
  PostMarkBookingAsUserCompletedReqSchema,
} from '../../schemas/request/postMarkBookingAsCompleted'
import type { Repo, Role } from '../../types'
import { getArrivalTime, getTransportPrice } from '../../utils'
import { ForbiddenError, NotFoundError } from '../../utils/Error'

const bookPro =
  ({ repo }: { repo: Repo }) =>
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
  }) => {
    const { longitude, latitude } = data

    PostBookProReqSchema.parse(data)

    const pro = await repo.user.getUserById(data.proId)

    if (!pro?.available) throw new ForbiddenError('Pro is not available')

    const bookings = await repo.book.getProBookingsByStatus(
      data.proId,
      BOOKING_STATUS.ACCEPTED,
    )

    if (bookings.length > 1) throw new ForbiddenError('pro currently busy')

    const userBookingsBySubService =
      await repo.book.getUserBookingsBySubService({
        subServiceId: data.subServiceId,
        userId: data.userId,
        status: BOOKING_STATUS.ACCEPTED,
      })

    if (userBookingsBySubService.length)
      throw new ForbiddenError('user has existing booking with service')

    const [distance, subService] = await Promise.all([
      repo.pro.getDistBtwLoctions({
        latitude,
        longitude,
        proId: data.proId,
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
  async ({ userId, bookingId }: { bookingId: number; userId: number }) => {
    PostAcceptBookingReqSchema.parse({ userId, bookingId })

    const booking = await repo.book.getBookingById(bookingId)

    if (!booking || booking.userId !== userId)
      throw new NotFoundError('booking not found')

    if (
      booking.status !== BOOKING_STATUS.PENDING &&
      booking.status !== BOOKING_STATUS.ACCEPTED
    )
      throw new NotFoundError('Booking cannot be rejected')

    await repo.book.updateBooking(bookingId, {
      status: BOOKING_STATUS.REJECTED,
      rejectedAt: new Date(),
    })
  }

const markBookingAsUserCompleted =
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
    PostMarkBookingAsUserCompletedReqSchema.parse({ userId, bookingId, role })

    const booking = await repo.book.getBookingById(bookingId)

    if (!booking || booking.userId !== userId)
      throw new NotFoundError('booking not found')

    if (booking.status !== BOOKING_STATUS.ACCEPTED)
      throw new NotFoundError('Booking cannot be rejected')

    if (booking.userCompleted)
      throw new ForbiddenError('booking already marked as completed')
    else
      await repo.book.updateBooking(bookingId, {
        userCompleted: true,
        status: booking.proCompleted ? BOOKING_STATUS.COMPLETED : undefined,
      })

    //TODO: trigger payment
  }

const markBookingAsProCompleted =
  ({ repo }: { repo: Repo }) =>
  async ({
    proId,
    bookingId,
    role,
  }: {
    bookingId: number
    proId: number
    role: Role
  }) => {
    PostMarkBookingAsProCompletedReqSchema.parse({ proId, bookingId, role })

    const booking = await repo.book.getBookingById(bookingId)

    if (!booking || booking.proId !== proId)
      throw new NotFoundError('booking not found')

    if (booking.status !== BOOKING_STATUS.ACCEPTED)
      throw new NotFoundError('Booking cannot be rejected')

    if (booking.proCompleted)
      throw new ForbiddenError('booking already marked as completed')
    else
      await repo.book.updateBooking(bookingId, {
        proCompleted: true,
        status: booking.userCompleted ? BOOKING_STATUS.COMPLETED : undefined,
      })
    //TODO: trigger payment
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

const getUncompletedBookings =
  ({ repo }: { repo: Repo }) =>
  async ({ userId }: { userId: number }) => {
    z.object({ userId: z.number() }).parse({ userId })

    const acceptedBookings = await repo.book.getProBookingsByStatuses(userId, [
      BOOKING_STATUS.ACCEPTED,
      BOOKING_STATUS.PENDING,
    ])

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
    markBookingAsUserCompleted: markBookingAsUserCompleted({ repo }),
    markBookingAsProCompleted: markBookingAsProCompleted({ repo }),
    markBookingAsArrived: markBookingAsArrived({ repo }),
    getUncompletedBookings: getUncompletedBookings({ repo }),
  }
}

export default makeBook
