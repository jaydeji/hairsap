import { Prisma, PrismaClient, SubService } from '@prisma/client'
import { BOOKING_STATUS, CHANNEL } from '../../config/constants'
import { PageReq } from '../../schemas/request/Page'
import { BookingStatus } from '../../types'
import { dayjs } from '../../utils'
import { getProBookings } from './getProBookings'

const getBookingById =
  ({ db }: { db: PrismaClient }) =>
  (bookingId: number) =>
    db.booking.findUnique({
      where: {
        bookingId,
      },
      include: { invoice: true },
    })

const getInvoiceById =
  ({ db }: { db: PrismaClient }) =>
  (invoiceId: number) =>
    db.invoice.findUnique({
      where: {
        invoiceId,
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
    channel: string
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
            channel: data.channel,
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

const getTransactions =
  ({ db }: { db: PrismaClient }) =>
  (userId: number) =>
    db.invoiceFees.findMany({
      where: {
        invoice: {
          paid: true,
          booking: {
            OR: [
              {
                userId,
              },
              {
                proId: userId,
              },
            ],
          },
        },
      },
      include: {
        invoice: {
          select: {
            booking: {
              select: {
                pro: {
                  select: {
                    name: true,
                    businessName: true,
                  },
                },
                user: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    })

const getTotalOfWeeklyCompletedBookings =
  ({ db }: { db: PrismaClient }) =>
  (proId: number) =>
    db.invoiceFees.aggregate({
      where: {
        invoice: {
          booking: { proId, status: BOOKING_STATUS.COMPLETED },
          createdAt: { gte: dayjs().startOf('week').toDate() },
        },
      },
      _sum: {
        price: true,
      },
    })

const addBonus =
  ({ db }: { db: PrismaClient }) =>
  (data: { proId: number; amount: number }) =>
    db.bonus.create({
      data,
    })

const getUnredeemedCashPayments =
  ({ db }: { db: PrismaClient }) =>
  async ({ proId }: { proId: number }) => {
    const unredeemedCashPayments = await db.invoice.findMany({
      where: {
        channel: CHANNEL.CASH,
        paid: {
          not: true,
        },
        booking: {
          proId,
        },
      },
      include: {
        invoiceFees: true,
      },
    })
    const total = unredeemedCashPayments.reduce(
      (acc, e) =>
        acc +
        e.invoiceFees.reduce((acc2, e2) => acc2 + e2.price, 0) +
        e.transportFee,
      0,
    )
    return { total, unredeemedCashPayments }
  }

const confirmPayoutRequest =
  ({ db }: { db: PrismaClient }) =>
  (invoiceId: number) =>
    db.invoice.update({
      data: {
        paid: true,
      },
      where: {
        invoiceId,
      },
    })

const getUnpaidBonuses =
  ({ db }: { db: PrismaClient }) =>
  () =>
    db.bonus.findMany({
      where: {
        paid: false,
      },
    })

const getBonusById =
  ({ db }: { db: PrismaClient }) =>
  (bonusId: number) =>
    db.bonus.findUnique({
      where: {
        bonusId,
      },
    })

const updateBonus =
  ({ db }: { db: PrismaClient }) =>
  (bonusId: number, data: Prisma.BonusUpdateInput) =>
    db.bonus.update({
      where: {
        bonusId,
      },
      data,
    })

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
    getInvoiceById: getInvoiceById({ db }),
    getTransactions: getTransactions({ db }),
    getTotalOfWeeklyCompletedBookings: getTotalOfWeeklyCompletedBookings({
      db,
    }),
    addBonus: addBonus({ db }),
    getUnredeemedCashPayments: getUnredeemedCashPayments({ db }),
    confirmPayoutRequest: confirmPayoutRequest({ db }),
    getUnpaidBonuses: getUnpaidBonuses({ db }),
    getBonusById: getBonusById({ db }),
    updateBonus: updateBonus({ db }),
  }
}

export default makeBookRepo