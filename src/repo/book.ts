import { Prisma, PrismaClient, SubService } from '@prisma/client'
import { BOOKING_STATUS } from '../config/constants'
import { GetProBookingsReq } from '../schemas/request/getProBookings'
import { PageReq } from '../schemas/request/Page'
import { BookingStatus } from '../types'
import { dayjs } from '../utils'

const getBookingById =
  ({ db }: { db: PrismaClient }) =>
  (bookingId: number) =>
    db.booking.findUnique({
      where: {
        bookingId,
      },
    })

const getBookingAndInvoiceById =
  ({ db }: { db: PrismaClient }) =>
  (bookingId: number) =>
    db.booking.findUnique({
      where: {
        bookingId,
      },
      include: {
        invoice: {
          include: {
            invoiceFees: true,
          },
        },
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

const getProBookingsByStatuses =
  ({ db }: { db: PrismaClient }) =>
  (proId: number, statuses: BookingStatus[]) =>
    db.booking.findMany({
      where: {
        proId,
        status: {
          in: statuses,
        },
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
    userId: number
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

const getUserBookings =
  ({ db }: { db: PrismaClient }) =>
  (userId: number, page: PageReq & { skip: number }) => {
    return db.$transaction([
      db.booking.count({
        where: {
          userId,
        },
        take: page.perPage,
        skip: page.skip,
      }),
      db.booking.findMany({
        where: {
          userId,
        },
        take: page.perPage,
        skip: page.skip,
      }),
    ])
  }

const getProBookings =
  ({ db }: { db: PrismaClient }) =>
  async ({
    period,
    proId,
    status,
  }: {
    proId: number
    status: GetProBookingsReq['status']
    period: GetProBookingsReq['period']
  }) => {
    const x = await db.booking.groupBy({
      by: ['proId', 'userId'],
      where: {
        proId,
        status: BOOKING_STATUS.COMPLETED,
        createdAt: { gte: dayjs().startOf(period).toDate() },
      },
      having: {
        userId:
          status === 'new'
            ? {
                lt: 2,
              }
            : {
                gt: 1,
              },
      },
      _count: true,
    })

    const y = await db.$transaction(
      x.map(({ proId, userId }) => {
        return db.invoiceFees.findMany({
          where: {
            invoice: {
              booking: {
                userId,
                proId,
              },
            },
          },
          select: {
            feeId: true,
            name: true,
            price: true,
            createdAt: true,
          },
        })
      }),
    )

    const flattenedServices = y.flat()
    const total = flattenedServices.reduce((acc, e) => acc + e.price, 0)

    return { count: x?.[0]._count || 0, services: flattenedServices, total }
  }

const makeBookRepo = ({ db }: { db: PrismaClient }) => {
  return {
    bookPro: bookPro({ db }),
    getSubService: getSubService({ db }),
    addServiceToBooking: addServiceToBooking({ db }),
    getBookingById: getBookingById({ db }),
    getBookingAndInvoiceById: getBookingAndInvoiceById({ db }),
    updateBooking: updateBooking({ db }),
    getProBookingsByStatus: getProBookingsByStatus({ db }),
    getProBookingsByStatuses: getProBookingsByStatuses({ db }),
    getProBookingsByProIdAndUserId: getProBookingsByProIdAndUserId({ db }),
    getUserBookingsBySubService: getUserBookingsBySubService({ db }),
    getUserBookings: getUserBookings({ db }),
    getProBookings: getProBookings({ db }),
  }
}

export default makeBookRepo
