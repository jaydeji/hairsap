import { Prisma, PrismaClient, SubService } from '@prisma/client'
import { BOOKING_STATUS } from '../config/constants'
import { BookingStatus } from '../types'

const getBookingById =
  ({ db }: { db: PrismaClient }) =>
  (bookingId: number) =>
    db.booking.findUnique({
      where: {
        bookingId,
      },
    })

const getProBookingsByStatus =
  ({ db }: { db: PrismaClient }) =>
  (proId: number, status: BookingStatus) =>
    db.booking.findMany({
      where: {
        proId,
        status,
      },
    })

const getProBookingsByProIdAndUserId =
  ({ db }: { db: PrismaClient }) =>
  (proId: number, userId: number, status?: BookingStatus) =>
    db.booking.findMany({
      where: {
        proId,
        status,
      },
    })

const getUserBookingsBySubService =
  ({ db }: { db: PrismaClient }) =>
  ({
    userId,
    status,
    subServiceId,
  }: {
    userId: number
    subServiceId: number
    status?: BookingStatus
  }) =>
    db.booking.findMany({
      where: {
        AND: [
          {
            userId,
            status,
          },
          {
            bookedSubServices: {
              some: {
                subService: {
                  service: {
                    subServices: {
                      some: {
                        subServiceId,
                      },
                    },
                  },
                },
              },
            },
          },
        ],
      },
    })

const addServiceToBooking =
  ({ db }: { db: PrismaClient }) =>
  async ({
    subService: { subServiceId, name, price },
    bookingId,
  }: {
    subService: SubService
    bookingId: number
  }) => {
    db.booking.update({
      data: {
        bookedSubServices: {
          create: {
            subServiceId: subServiceId,
          },
        },
        invoice: {
          update: {
            invoiceFees: {
              create: {
                name,
                price,
              },
            },
          },
        },
      },
      where: {
        bookingId,
      },
    })
  }

const bookPro =
  ({ db }: { db: PrismaClient }) =>
  (data: {
    subServiceId: number
    subServiceFee: number
    subServiceName: string
    userId: number
    proId: number
    address: string
    distance: number
    transportFee: number
    arrivalAt: Date
    samplePhotoUrl?: string
    samplePhotoKey?: string
    samplePhotoOriginalFileName?: string
  }) =>
    db.booking.create({
      data: {
        address: data.address,
        status: BOOKING_STATUS.PENDING,
        userId: data.userId,
        proId: data.proId,
        arrivalAt: data.arrivalAt,
        samplePhotoUrl: data.samplePhotoUrl,
        samplePhotoKey: data.samplePhotoKey,
        samplePhotoOriginalFileName: data.samplePhotoOriginalFileName,
        bookedSubServices: {
          create: {
            subServiceId: data.subServiceId,
          },
        },
        invoice: {
          create: {
            distance: data.distance,
            transportFee: data.transportFee,
            invoiceFees: {
              create: {
                name: data.subServiceName,
                price: data.subServiceFee,
              },
            },
          },
        },
      },
      include: {
        invoice: {
          select: {
            invoiceId: true,
          },
        },
      },
    })

const getSubService =
  ({ db }: { db: PrismaClient }) =>
  (subServiceId: number) =>
    db.subService.findUnique({
      where: {
        subServiceId,
      },
    })

const updateBooking =
  ({ db }: { db: PrismaClient }) =>
  (bookingId: number, data: Prisma.BookingUpdateInput) =>
    db.booking.update({
      data,
      where: {
        bookingId,
      },
    })

const makeBookRepo = ({ db }: { db: PrismaClient }) => {
  return {
    bookPro: bookPro({ db }),
    getSubService: getSubService({ db }),
    addServiceToBooking: addServiceToBooking({ db }),
    getBookingById: getBookingById({ db }),
    updateBooking: updateBooking({ db }),
    getProBookingsByStatus: getProBookingsByStatus({ db }),
    getProBookingsByProIdAndUserId: getProBookingsByProIdAndUserId({ db }),
    getUserBookingsBySubService: getUserBookingsBySubService({
      db,
    }),
  }
}

export default makeBookRepo
