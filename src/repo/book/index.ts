import { Prisma, PrismaClient, SubService } from '@prisma/client'
import { BOOKING_STATUS, CHANNEL, PIN_STATUS } from '../../config/constants'
import { PageReq } from '../../schemas/request/Page'
import { computeBookingTotal, resolveAmount } from '../../services/Book/util'
import { BookingStatus } from '../../types'
import { dayjs } from '../../utils'
import { getProBookings } from './getProBookings'
import { getMissedBookings } from './getMissedBookings'

const getBookingById =
  ({ db }: { db: PrismaClient }) =>
  (bookingId: number) =>
    db.booking.findUnique({
      where: {
        bookingId,
      },
      include: {
        invoice: {
          include: {
            promo: {
              include: { discount: true },
            },
            invoiceFees: true,
          },
        },
      },
    })

const getBookingByIdAndMore =
  ({ db }: { db: PrismaClient }) =>
  async (bookingId: number) => {
    const data = await db.booking.findUnique({
      where: {
        bookingId,
      },
      select: {
        bookingId: true,
        arrived: true,
        inTransit: true,
        address: true,
        samplePhotoUrl: true,
        status: true,
        acceptedAt: true,
        rejectedAt: true,
        arrivalAt: true,
        cancelledAt: true,
        rating: true,
        pinDate: true,
        pinStatus: true,
        pinAmount: true,
        pro: {
          select: {
            address: true,
            available: true,
            businessName: true,
            createdAt: true,
            userId: true,
            longitude: true,
            latitude: true,
            profilePhotoUrl: true,
            email: true,
            name: true,
            phone: true,
          },
        },
        proId: true,
        user: {
          select: {
            address: true,
            available: true,
            createdAt: true,
            userId: true,
            longitude: true,
            latitude: true,
            profilePhotoUrl: true,
            faceIdPhotoUrl: true,
            email: true,
            name: true,
            phone: true,
          },
        },
        userId: true,
        invoice: {
          select: {
            transportFee: true,
            distance: true,
            promo: {
              include: { discount: true },
            },
            channel: true,
            invoiceFees: {
              select: {
                name: true,
                price: true,
                createdAt: true,
                feeId: true,
              },
            },
          },
        },
        bookedSubServices: {
          select: {
            subService: {
              select: {
                name: true,
                photoUrl: true,
                subServiceId: true,
              },
            },
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    })

    return data
  }

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
            promo: {
              include: { discount: true },
            },
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

const getBookingsByStatusAndMore =
  ({ db }: { db: PrismaClient }) =>
  (userId: number, statuses: BookingStatus[]) =>
    db.booking.findMany({
      where: {
        OR: [{ userId }, { proId: userId }],
        status: { in: statuses },
      },
      select: {
        bookingId: true,
        arrived: true,
        inTransit: true,
        address: true,
        samplePhotoUrl: true,
        status: true,
        acceptedAt: true,
        rejectedAt: true,
        arrivalAt: true,
        cancelledAt: true,
        pinDate: true,
        pinStatus: true,
        pinAmount: true,
        pro: {
          select: {
            address: true,
            available: true,
            businessName: true,
            createdAt: true,
            userId: true,
            longitude: true,
            latitude: true,
            profilePhotoUrl: true,
            email: true,
            name: true,
            phone: true,
          },
        },
        proId: true,
        user: {
          select: {
            address: true,
            available: true,
            createdAt: true,
            userId: true,
            longitude: true,
            latitude: true,
            profilePhotoUrl: true,
            faceIdPhotoUrl: true,
            email: true,
            name: true,
            phone: true,
          },
        },
        userId: true,
        invoice: {
          select: {
            transportFee: true,
            distance: true,
            invoiceFees: {
              select: {
                name: true,
                price: true,
                createdAt: true,
                feeId: true,
              },
            },
          },
        },
        bookedSubServices: {
          select: {
            subService: {
              select: {
                name: true,
                photoUrl: true,
                subServiceId: true,
              },
            },
          },
        },
        createdAt: true,
        updatedAt: true,
      },
      orderBy: [
        {
          pinStatus: 'desc',
        },
        {
          updatedAt: 'desc',
        },
      ],
    })

const getBookingActivity =
  ({ db }: { db: PrismaClient }) =>
  async ({ userId }: { userId: number }) => {
    const bookings = await db.booking.findMany({
      where: {
        OR: [{ userId }, { proId: userId }],
        status: {
          in: [BOOKING_STATUS.ACCEPTED, BOOKING_STATUS.PENDING],
        },
        // createdAt: {
        // gte: dayjs().subtract(1, 'w').toDate(),
        // },
        NOT: {
          auto: true,
          status: BOOKING_STATUS.PENDING,
          createdAt: {
            lt: dayjs().subtract(2, 'minute').toDate(),
          },
        },
      },
      select: {
        bookingId: true,
        arrived: true,
        inTransit: true,
        address: true,
        samplePhotoUrl: true,
        status: true,
        acceptedAt: true,
        rejectedAt: true,
        arrivalAt: true,
        cancelledAt: true,
        auto: true,
        pinAmount: true,
        pinDate: true,
        pinStatus: true,
        pro: {
          select: {
            address: true,
            available: true,
            businessName: true,
            createdAt: true,
            userId: true,
            longitude: true,
            latitude: true,
            profilePhotoUrl: true,
            email: true,
            name: true,
            phone: true,
          },
        },
        proId: true,
        user: {
          select: {
            address: true,
            available: true,
            createdAt: true,
            userId: true,
            longitude: true,
            latitude: true,
            profilePhotoUrl: true,
            faceIdPhotoUrl: true,

            email: true,
            name: true,
            phone: true,
          },
        },
        userId: true,
        invoice: {
          select: {
            transportFee: true,
            distance: true,
            promo: {
              include: {
                discount: true,
              },
            },
            invoiceFees: {
              select: {
                name: true,
                price: true,
                createdAt: true,
                feeId: true,
              },
            },
          },
        },
        bookedSubServices: {
          select: {
            subService: {
              select: {
                name: true,
                photoUrl: true,
                subServiceId: true,
              },
            },
          },
        },
        createdAt: true,
        updatedAt: true,
      },
      orderBy: [
        {
          pinStatus: 'desc',
        },
        {
          updatedAt: 'desc',
        },
      ],
    })

    const userIds = bookings.map((e) => e.userId)

    const completedBookings = await db.booking.findMany({
      where: {
        userId: {
          in: userIds,
        },
        proId: userId,
        status: BOOKING_STATUS.COMPLETED,
      },
      select: {
        userId: true,
      },
    })

    const _bookings = bookings.map((e) => ({
      ...e,
      new: !completedBookings.find((f) => e.userId === f.userId),
    }))

    return _bookings.map((e) => computeBookingTotal(e))
  }

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

const getUserBookingsByService =
  ({ db }: { db: PrismaClient }) =>
  ({
    userId,
    status,
    serviceId,
  }: {
    userId: number
    serviceId: number
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
                  serviceId,
                },
              },
            },
          },
        ],
      },
    })

const getPendingUserBookingByServiceAndRange =
  ({ db }: { db: PrismaClient }) =>
  ({ userId, serviceId }: { userId: number; serviceId: number }) =>
    db.booking.findFirst({
      where: {
        userId,
        status: BOOKING_STATUS.PENDING,
        bookedSubServices: {
          some: {
            subService: {
              serviceId,
            },
          },
        },
        createdAt: {
          gte: dayjs().subtract(1, 'minute').subtract(10, 'second').toDate(),
        },
      },
    })

const setBookingSubservices =
  ({ db }: { db: PrismaClient }) =>
  async ({
    add,
    remove,
    bookingId,
  }: {
    add: SubService[]
    remove: number[]
    bookingId: number
    userId: number
  }) => {
    return db.booking.update({
      data: {
        bookedSubServices: {
          createMany: {
            data: add.map(({ subServiceId }) => ({ subServiceId })),
            skipDuplicates: true,
          },
          deleteMany: {
            subServiceId: { in: remove },
          },
        },
        invoice: {
          update: {
            invoiceFees: {
              createMany: {
                data: add.map((e) => ({
                  name: e.name,
                  price: e.price,
                  subServiceId: e.subServiceId,
                })),
                skipDuplicates: true,
              },
              deleteMany: { subServiceId: { in: remove } },
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
    subServices: {
      subServiceId: number
      subServiceFee: number
      subServiceName: string
    }[]
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
    code?: string
    auto: boolean
  }) =>
    db.booking.create({
      data: {
        address: data.address,
        status: BOOKING_STATUS.PENDING,
        userId: data.userId,
        proId: data.proId,
        arrivalAt: data.arrivalAt,
        auto: data.auto,
        samplePhotoUrl: data.samplePhotoUrl,
        samplePhotoKey: data.samplePhotoKey,
        samplePhotoOriginalFileName: data.samplePhotoOriginalFileName,
        bookedSubServices: {
          createMany: {
            data: data.subServices.map(({ subServiceId }) => ({
              subServiceId,
            })),
          },
        },
        invoice: {
          create: {
            channel: data.channel,
            distance: data.distance,
            transportFee: data.transportFee,
            promo: data.code
              ? {
                  connect: {
                    code: data.code,
                  },
                }
              : undefined,
            invoiceFees: {
              createMany: {
                data: data.subServices.map((e) => ({
                  subServiceId: e.subServiceId,
                  name: e.subServiceName,
                  price: e.subServiceFee,
                })),
              },
            },
          },
        },
      },
      include: {
        invoice: {
          select: {
            invoiceId: true,
            transportFee: true,
            promo: {
              include: { discount: true },
            },
            invoiceFees: true,
            distance: true,
          },
        },
        pro: {
          select: {
            address: true,
            businessName: true,
            name: true,
            available: true,
            userId: true,
          },
        },
        bookedSubServices: {
          select: {
            subService: true,
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

const getSubServices =
  ({ db }: { db: PrismaClient }) =>
  (subServiceIds: number[]) =>
    db.subService.findMany({
      where: {
        subServiceId: { in: subServiceIds },
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

const getProbookingCount =
  ({ db }: { db: PrismaClient }) =>
  (proId: number) => {
    return db.booking.count({
      where: {
        proId,
        status: BOOKING_STATUS.COMPLETED,
      },
    })
  }

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
        include: {
          user: {
            select: {
              name: true,
              profilePhotoUrl: true,
              faceIdPhotoUrl: true,
            },
          },
          pro: {
            select: {
              name: true,
              businessName: true,
              profilePhotoUrl: true,
            },
          },
          bookedSubServices: {
            select: {
              subService: {
                select: {
                  name: true,
                  price: true,
                  subServiceId: true,
                },
              },
            },
          },
        },
        take: page.perPage,
        skip: page.skip,
      }),
    ])
  }

const getTransactions =
  ({ db }: { db: PrismaClient }) =>
  async (userId: number) => {
    const [subServices, bookings] = await db.$transaction([
      db.subService.findMany({ include: { service: true } }),
      db.booking.findMany({
        where: {
          OR: [{ userId }, { proId: userId }],
          status: BOOKING_STATUS.COMPLETED,
        },
        select: {
          bookingId: true,
          completedAt: true,
          pinAmount: true,
          pro: {
            select: {
              businessName: true,
              name: true,
              profilePhotoUrl: true,
            },
          },
          user: {
            select: {
              name: true,
              profilePhotoUrl: true,
              faceIdPhotoUrl: true,
            },
          },
          invoice: {
            select: {
              transportFee: true,
              promo: {
                include: { discount: true },
              },
              promoAmount: true,
              invoiceFees: {
                select: {
                  price: true,
                  subServiceId: true,
                },
              },
            },
          },
        },
      }),
    ])

    return bookings.map((booking) => {
      return {
        bookingId: booking.bookingId,
        pro: booking.pro,
        user: booking.user,
        completedAt: booking.completedAt,
        service: subServices.find(
          (e) =>
            e.subServiceId === booking.invoice?.invoiceFees?.[0]?.subServiceId,
        )?.service,
        total: computeBookingTotal(booking).total,
      }
    })
  }

const getTotalOfWeeklyCompletedBookings =
  ({ db }: { db: PrismaClient }) =>
  (proId: number) =>
    db.invoiceFees.aggregate({
      where: {
        invoice: {
          booking: { proId, status: BOOKING_STATUS.COMPLETED },
          createdAt: { gte: dayjs().subtract(2, 'w').toDate() },
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
          status: BOOKING_STATUS.COMPLETED,
        },
      },
      include: {
        invoiceFees: true,
        promo: {
          include: { discount: true },
        },
        booking: { select: { pinAmount: true } },
      },
    })

    const total = unredeemedCashPayments.reduce(
      (acc, e) =>
        acc +
        resolveAmount({
          invoice: e.invoiceFees.reduce((acc2, e2) => acc2 + e2.price, 0),
          transport: 0,
          code: e.promo?.discount.name,
          pinAmount: e.booking.pinAmount,
        }).total,
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

const updateInvoice =
  ({ db }: { db: PrismaClient }) =>
  (invoiceId: number, data: Prisma.InvoiceUpdateInput) =>
    db.invoice.update({
      where: {
        invoiceId,
      },
      data,
    })

const getOngoingPinnedBookings =
  ({ db }: { db: PrismaClient }) =>
  (proId: number) =>
    db.booking.findMany({
      where: {
        proId,
        pinStatus: { notIn: [PIN_STATUS.CANCELLED, PIN_STATUS.REJECTED] },
        status: {
          notIn: [
            BOOKING_STATUS.CANCELLED,
            BOOKING_STATUS.COMPLETED,
            BOOKING_STATUS.REJECTED,
          ],
        },
      },
      include: {
        user: {
          select: {
            name: true,
            userId: true,
            profilePhotoUrl: true,
          },
        },
        bookedSubServices: {
          select: {
            subService: {
              select: {
                name: true,
                subServiceId: true,
                price: true,
                info: true,
                photoUrl: true,
              },
            },
          },
        },
      },
    })

const makeBookRepo = ({ db }: { db: PrismaClient }) => {
  return {
    bookPro: bookPro({ db }),
    getSubService: getSubService({ db }),
    getSubServices: getSubServices({ db }),
    setBookingSubservices: setBookingSubservices({ db }),
    getBookingById: getBookingById({ db }),
    getBookingByIdAndMore: getBookingByIdAndMore({ db }),
    getBookingAndInvoiceById: getBookingAndInvoiceById({ db }),
    updateBooking: updateBooking({ db }),
    getProBookingsByStatus: getProBookingsByStatus({ db }),
    getBookingsByStatusAndMore: getBookingsByStatusAndMore({ db }),
    getBookingActivity: getBookingActivity({ db }),
    getProBookingsByProIdAndUserId: getProBookingsByProIdAndUserId({ db }),
    getUserBookingsBySubService: getUserBookingsBySubService({ db }),
    getUserBookingsByService: getUserBookingsByService({ db }),
    getUserBookings: getUserBookings({ db }),
    getProBookings: getProBookings({ db }),
    getInvoiceById: getInvoiceById({ db }),
    updateInvoice: updateInvoice({ db }),
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
    getPendingUserBookingByServiceAndRange:
      getPendingUserBookingByServiceAndRange({ db }),
    getProbookingCount: getProbookingCount({ db }),
    getMissedBookings: getMissedBookings({ db }),
    getOngoingPinnedBookings: getOngoingPinnedBookings({ db }),
  }
}

export default makeBookRepo
