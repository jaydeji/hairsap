import 'dotenv/config'
import { PrismaClient, Prisma, PrismaPromise } from '@prisma/client'
import { logger } from '../src/utils'
import { DISCOUNT } from '../src/config/constants'

const prisma = new PrismaClient({
  log: ['query', 'error'],
})

const userData: Prisma.UserCreateManyInput[] = [
  {
    address: 'no 2',
    email: 'jideadedejifirst@gmail.com',
    name: 'Jide Adedeji',
    profilePhotoUrl: null,
    role: 'user',
    userId: 2,
    password:
      'e6f05048fbd74322097eb596700ce2357d9aed2db4b9772dec61f17bd4fa5a95',
    phone: '+2348118161237',
    verified: true,
  },
  {
    address: 'no 3',
    email: 'topeadedejifirst@gmail.com',
    name: 'Tope Adedeji',
    profilePhotoUrl: null,
    role: 'user',
    userId: 3,
    password:
      'e6f05048fbd74322097eb596700ce2357d9aed2db4b9772dec61f17bd4fa5a95',
    phone: '+2348118161236',
    verified: true,
  },
  {
    address: 'no 4',
    email: 'jamesadedejifirst@gmail.com',
    name: 'James Adedeji',
    profilePhotoUrl: null,
    role: 'pro',
    userId: 4,
    password:
      'e6f05048fbd74322097eb596700ce2357d9aed2db4b9772dec61f17bd4fa5a95',
    phone: '+2348118161237',
    longitude: 3.372669140201567,
    latitude: 6.518572387441918,
    verified: true,
    approved: true,
  },
]

const serviceData: Prisma.ServiceCreateManyInput[] = [
  {
    name: 'Braiding',
    photoUrl:
      'https://hairsap.fra1.cdn.digitaloceanspaces.com/servicephoto/1.jpeg',
    serviceId: 1,
  },
  {
    name: 'Styling',
    photoUrl:
      'https://hairsap.fra1.cdn.digitaloceanspaces.com/servicephoto/2.jpeg',
    serviceId: 2,
  },
  {
    name: 'Barbing',
    photoUrl:
      'https://hairsap.fra1.cdn.digitaloceanspaces.com/servicephoto/3.jpeg',
    serviceId: 3,
  },
  {
    name: 'Locs',
    photoUrl:
      'https://hairsap.fra1.cdn.digitaloceanspaces.com/servicephoto/4.jpeg',
    serviceId: 4,
  },
]

const subServiceBraids: Prisma.SubServiceCreateManyInput[] = [
  {
    name: 'Knotless braids Large',
    photoUrl:
      'https://hairsap.fra1.cdn.digitaloceanspaces.com/subservicephoto/1.jpeg',
    serviceId: 1,
    subServiceId: 1,
    order: 1,
    price: 15000 * 100,
  },
  {
    name: 'Knotless braids Medium',
    photoUrl:
      'https://hairsap.fra1.cdn.digitaloceanspaces.com/subservicephoto/2.jpeg',
    serviceId: 1,
    subServiceId: 2,
    order: 2,
    price: 20000 * 100,
  },
  {
    name: 'Knotless braids Small',
    photoUrl:
      'https://hairsap.fra1.cdn.digitaloceanspaces.com/subservicephoto/3.jpeg',
    serviceId: 1,
    subServiceId: 3,
    order: 3,
    price: 30000 * 100,
  },
  {
    name: 'Goddess/Jungle braids Large',
    photoUrl:
      'https://hairsap.fra1.cdn.digitaloceanspaces.com/subservicephoto/5.jpeg',
    serviceId: 1,
    subServiceId: 5,
    order: 4,
    price: 20000 * 100,
  },
  {
    name: 'Goddess/Jungle braids Medium',
    photoUrl:
      'https://hairsap.fra1.cdn.digitaloceanspaces.com/subservicephoto/6.jpeg',
    serviceId: 1,
    subServiceId: 6,
    order: 5,
    price: 25000 * 100,
  },
  {
    name: 'Goddess/Jungle braids Small',
    photoUrl:
      'https://hairsap.fra1.cdn.digitaloceanspaces.com/subservicephoto/7.jpeg',
    serviceId: 1,
    subServiceId: 7,
    order: 6,
    price: 35000 * 100,
  },
  {
    name: 'Box braids Large',
    photoUrl:
      'https://hairsap.fra1.cdn.digitaloceanspaces.com/subservicephoto/8.jpeg',
    serviceId: 1,
    subServiceId: 8,
    order: 7,
    price: 10000 * 100,
  },
  {
    name: 'Box braids Medium',
    photoUrl:
      'https://hairsap.fra1.cdn.digitaloceanspaces.com/subservicephoto/9.jpeg',
    serviceId: 1,
    subServiceId: 9,
    order: 8,
    price: 15000 * 100,
  },
  {
    name: 'Box braids Small',
    photoUrl:
      'https://hairsap.fra1.cdn.digitaloceanspaces.com/subservicephoto/10.jpeg',
    serviceId: 1,
    subServiceId: 10,
    order: 9,
    price: 25000 * 100,
  },
  {
    name: 'Butterfly/Faux Bob/shoulder length',
    photoUrl:
      'https://hairsap.fra1.cdn.digitaloceanspaces.com/subservicephoto/18.jpeg',
    serviceId: 1,
    subServiceId: 18,
    order: 10,
    price: 20000 * 100,
  },
  {
    name: 'Butterfly/Faux Locs Mid back length',
    photoUrl:
      'https://hairsap.fra1.cdn.digitaloceanspaces.com/subservicephoto/19.jpeg',
    serviceId: 1,
    subServiceId: 19,
    order: 11,
    price: 25000 * 100,
  },
  {
    name: 'Butterfly/Faux Locs Butt length',
    photoUrl:
      'https://hairsap.fra1.cdn.digitaloceanspaces.com/subservicephoto/20.jpeg',
    serviceId: 1,
    subServiceId: 20,
    order: 12,
    price: 35000 * 100,
  },
  {
    name: 'All types of Twist Large',
    photoUrl:
      'https://hairsap.fra1.cdn.digitaloceanspaces.com/subservicephoto/11.jpeg',
    serviceId: 1,
    subServiceId: 11,
    order: 13,
    price: 15000 * 100,
  },
  {
    name: 'All types of Twist Medium',
    photoUrl:
      'https://hairsap.fra1.cdn.digitaloceanspaces.com/subservicephoto/12.jpeg',
    serviceId: 1,
    subServiceId: 12,
    order: 14,
    price: 20000 * 100,
  },
  {
    name: 'All types of Twist Small',
    photoUrl:
      'https://hairsap.fra1.cdn.digitaloceanspaces.com/subservicephoto/13.jpeg',
    serviceId: 1,
    subServiceId: 13,
    order: 15,
    price: 30000 * 100,
  },
  {
    name: 'Stitch braids cornrow (6-8 stitches)',
    photoUrl:
      'https://hairsap.fra1.cdn.digitaloceanspaces.com/subservicephoto/14.jpeg',
    serviceId: 1,
    subServiceId: 14,
    order: 16,
    price: 10000 * 100,
  },
  {
    name: 'Stitch braids cornrow (10-14 stitches)',
    photoUrl:
      'https://hairsap.fra1.cdn.digitaloceanspaces.com/subservicephoto/15.jpeg',
    serviceId: 1,
    subServiceId: 15,
    order: 17,
    price: 15000 * 100,
  },
  {
    name: 'Stitch braids cornrow (14+ stitches)',
    photoUrl:
      'https://hairsap.fra1.cdn.digitaloceanspaces.com/subservicephoto/16.jpeg',
    serviceId: 1,
    subServiceId: 16,
    order: 18,
    price: 20000 * 100,
  },
  {
    name: 'Stitch braids with design',
    photoUrl:
      'https://hairsap.fra1.cdn.digitaloceanspaces.com/subservicephoto/17.jpeg',
    serviceId: 1,
    subServiceId: 17,
    order: 19,
    price: 15000 * 100,
  },
  {
    name: 'Lemonade braids',
    photoUrl:
      'https://hairsap.fra1.cdn.digitaloceanspaces.com/subservicephoto/21.jpeg',
    serviceId: 1,
    subServiceId: 21,
    order: 20,
    price: 20000 * 100,
  },
  {
    name: '14+ Regular all back cornrow',
    photoUrl:
      'https://hairsap.fra1.cdn.digitaloceanspaces.com/subservicephoto/22.jpeg',
    serviceId: 1,
    subServiceId: 22,
    order: 21,
    price: 20000 * 100,
  },
  {
    name: '6-8 Cornrow braids',
    photoUrl:
      'https://hairsap.fra1.cdn.digitaloceanspaces.com/subservicephoto/23.jpeg',
    serviceId: 1,
    subServiceId: 23,
    order: 22,
    price: 10000 * 100,
  },
  {
    name: 'Micro braids',
    photoUrl:
      'https://hairsap.fra1.cdn.digitaloceanspaces.com/subservicephoto/4.jpeg',
    serviceId: 1,
    subServiceId: 4,
    order: 23,
    price: 50000 * 100,
  },
  {
    name: 'Criss cross braids',
    photoUrl:
      'https://hairsap.fra1.cdn.digitaloceanspaces.com/subservicephoto/24.jpeg',
    serviceId: 1,
    subServiceId: 24,
    order: 24,
    price: 20000 * 100,
  },
  {
    name: 'All Crotchet',
    photoUrl:
      'https://hairsap.fra1.cdn.digitaloceanspaces.com/subservicephoto/25.jpeg',
    serviceId: 1,
    subServiceId: 25,
    order: 25,
    price: 10000 * 100,
  },
  {
    name: 'Pop smoke goddess braid',
    photoUrl:
      'https://hairsap.fra1.cdn.digitaloceanspaces.com/subservicephoto/61.jpg',
    serviceId: 1,
    subServiceId: 61,
    order: 26,
    price: 15000 * 100,
  },
  {
    name: 'Chunky bun',
    photoUrl:
      'https://hairsap.fra1.cdn.digitaloceanspaces.com/subservicephoto/26.jpeg',
    serviceId: 1,
    subServiceId: 26,
    order: 27,
    price: 10000 * 100,
  },
  {
    name: 'Natural Twist',
    photoUrl:
      'https://hairsap.fra1.cdn.digitaloceanspaces.com/subservicephoto/62.jpeg',
    serviceId: 1,
    subServiceId: 62,
    order: 28,
    price: 5000 * 100,
  },
  {
    name: 'Natural cornrow',
    photoUrl:
      'https://hairsap.fra1.cdn.digitaloceanspaces.com/subservicephoto/63.jpeg',
    serviceId: 1,
    subServiceId: 63,
    order: 29,
    price: 5000 * 100,
  },
  {
    name: 'Color tint',
    info: 'Black & bleach custom color. Customers will be responsible for an alternative dye color',
    photoUrl:
      'https://hairsap.fra1.cdn.digitaloceanspaces.com/subservicephoto/27.jpeg',
    serviceId: 1,
    subServiceId: 27,
    order: 30,
    price: 5000 * 100,
  },
  {
    name: 'Braids takedown',
    photoUrl:
      'https://hairsap.fra1.cdn.digitaloceanspaces.com/subservicephoto/28.jpeg',
    serviceId: 1,
    subServiceId: 28,
    order: 31,
    price: 3000 * 100,
  },
]

const subServiceStyling: Prisma.SubServiceCreateManyInput[] = [
  {
    name: '360 Frontal installation & styling',
    info: 'Include lace adhesive. Can last 5 days to 2 weeks',
    photoUrl:
      'https://hairsap.fra1.cdn.digitaloceanspaces.com/subservicephoto/29.jpeg',
    serviceId: 2,
    subServiceId: 29,
    order: 32,
    price: 30000 * 100,
  },
  {
    name: 'Glued Frontal installation & styling',
    info: 'Include lace adhesive. Can last 5 days to 2 weeks',
    photoUrl:
      'https://hairsap.fra1.cdn.digitaloceanspaces.com/subservicephoto/30.jpeg',
    serviceId: 2,
    subServiceId: 30,
    order: 33,
    price: 20000 * 100,
  },
  {
    name: 'Glued Closure installation & styling',
    photoUrl:
      'https://hairsap.fra1.cdn.digitaloceanspaces.com/subservicephoto/31.jpeg',
    info: 'Include lace adhesive. Can last 5 days to 2 weeks',
    serviceId: 2,
    subServiceId: 31,
    order: 34,
    price: 15000 * 100,
  },
  {
    name: 'Glueless Frontal installation & styling',
    info: 'No lace adhesive. It can be taken off same day',
    photoUrl:
      'https://hairsap.fra1.cdn.digitaloceanspaces.com/subservicephoto/52.jpeg',
    serviceId: 2,
    subServiceId: 52,
    order: 35,
    price: 15000 * 100,
  },
  {
    name: 'Glueless Closure installation & styling',
    info: 'No lace adhesive. It can be taken off same day',
    photoUrl:
      'https://hairsap.fra1.cdn.digitaloceanspaces.com/subservicephoto/53.jpeg',
    serviceId: 2,
    subServiceId: 53,
    order: 36,
    price: 13000 * 100,
  },
  {
    name: 'General styling',
    photoUrl:
      'https://hairsap.fra1.cdn.digitaloceanspaces.com/subservicephoto/53.jpg',
    serviceId: 2,
    subServiceId: 64,
    order: 37,
    price: 10000 * 100,
  },
  {
    name: 'Frontal ponytail',
    photoUrl:
      'https://hairsap.fra1.cdn.digitaloceanspaces.com/subservicephoto/32.jpeg',
    serviceId: 2,
    subServiceId: 32,
    order: 38,
    price: 30000 * 100,
  },
  {
    name: 'Gel ponytail',
    photoUrl:
      'https://hairsap.fra1.cdn.digitaloceanspaces.com/subservicephoto/33.jpeg',
    serviceId: 2,
    subServiceId: 33,
    order: 39,
    price: 15000 * 100,
  },
  {
    name: 'Natural hair',
    info: 'Black & bleach custom color. Customers will be responsible for an alternative dye color',
    photoUrl:
      'https://hairsap.fra1.cdn.digitaloceanspaces.com/subservicephoto/34.jpeg',
    serviceId: 2,
    subServiceId: 34,
    order: 40,
    price: 5000 * 100,
  },
  {
    name: 'Pixie cut',
    photoUrl:
      'https://hairsap.fra1.cdn.digitaloceanspaces.com/subservicephoto/35.jpeg',
    serviceId: 2,
    subServiceId: 35,
    order: 41,
    price: 15000 * 100,
  },
  {
    name: 'Natural hair Blowout',
    photoUrl:
      'https://hairsap.fra1.cdn.digitaloceanspaces.com/subservicephoto/36.jpeg',
    serviceId: 2,
    subServiceId: 36,
    order: 42,
    price: 5000 * 100,
  },
  {
    name: 'Frontal Wigging',
    info: 'Include customization where necessary',
    photoUrl:
      'https://hairsap.fra1.cdn.digitaloceanspaces.com/subservicephoto/56.jpeg',
    serviceId: 2,
    subServiceId: 56,
    order: 43,
    price: 30000 * 100,
  },
  {
    name: 'Closure Wigging',
    info: 'Include customization where necessary',
    photoUrl:
      'https://hairsap.fra1.cdn.digitaloceanspaces.com/subservicephoto/57.jpeg',
    serviceId: 2,
    subServiceId: 57,
    order: 44,
    price: 25000 * 100,
  },
  {
    name: '360 Wigging',
    info: 'Include customization where necessary',
    photoUrl:
      'https://hairsap.fra1.cdn.digitaloceanspaces.com/subservicephoto/65.jpg',
    serviceId: 2,
    subServiceId: 65,
    order: 45,
    price: 40000 * 100,
  },
  {
    name: 'Frontal Customization',
    info: 'Include bleaching of the knots and plucking the hairline',
    photoUrl:
      'https://hairsap.fra1.cdn.digitaloceanspaces.com/subservicephoto/58.jpeg',
    serviceId: 2,
    subServiceId: 58,
    order: 46,
    price: 20000 * 100,
  },
  {
    name: 'Closure Customization',
    info: 'Include bleaching of the knots and plucking the hairline',
    photoUrl:
      'https://hairsap.fra1.cdn.digitaloceanspaces.com/subservicephoto/66.jpg',
    serviceId: 2,
    subServiceId: 66,
    order: 47,
    price: 10000 * 100,
  },
  {
    name: '360 Customization',
    info: 'Include bleaching of the knots and plucking the hairline',
    photoUrl:
      'https://hairsap.fra1.cdn.digitaloceanspaces.com/subservicephoto/67.jpg',
    serviceId: 2,
    subServiceId: 67,
    order: 48,
    price: 25000 * 100,
  },
  {
    name: 'Revamping',
    photoUrl:
      'https://hairsap.fra1.cdn.digitaloceanspaces.com/subservicephoto/59.jpeg',
    serviceId: 2,
    subServiceId: 59,
    order: 49,
    price: 10000 * 100,
  },
]

const subServiceBarbing: Prisma.SubServiceCreateManyInput[] = [
  {
    name: 'Hair cut/ grooming',
    photoUrl:
      'https://hairsap.fra1.cdn.digitaloceanspaces.com/subservicephoto/38.jpeg',
    serviceId: 3,
    subServiceId: 38,
    order: 50,
    price: 5000 * 100,
  },
  {
    name: 'Color tint',
    info: 'Black & bleach custom color. Customers will be responsible for an alternative dye color',
    photoUrl:
      'https://hairsap.fra1.cdn.digitaloceanspaces.com/subservicephoto/40.jpeg',
    serviceId: 3,
    subServiceId: 40,
    order: 51,
    price: 5000 * 100,
  },
]

const subServiceLocks: Prisma.SubServiceCreateManyInput[] = [
  {
    name: 'Instant starter locs',
    photoUrl:
      'https://hairsap.fra1.cdn.digitaloceanspaces.com/subservicephoto/41.jpeg',
    serviceId: 4,
    subServiceId: 41,
    order: 52,
    price: 30000 * 100,
  },
  {
    name: 'Instant starter locs with extensions',
    photoUrl:
      'https://hairsap.fra1.cdn.digitaloceanspaces.com/subservicephoto/47.jpeg',
    serviceId: 4,
    subServiceId: 47,
    order: 53,
    price: 40000 * 100,
  },
  {
    name: 'Starter Locs',
    info: 'This method comes with comb twist or regular twist',
    photoUrl:
      'https://hairsap.fra1.cdn.digitaloceanspaces.com/subservicephoto/42.jpeg',
    serviceId: 4,
    subServiceId: 42,
    order: 54,
    price: 15000 * 100,
  },
  {
    name: 'Sister Locs',
    photoUrl:
      'https://hairsap.fra1.cdn.digitaloceanspaces.com/subservicephoto/46.jpeg',
    serviceId: 4,
    subServiceId: 46,
    order: 55,
    price: 60000 * 100,
  },
  {
    name: 'Retwisting maintenance & styling',
    photoUrl:
      'https://hairsap.fra1.cdn.digitaloceanspaces.com/subservicephoto/50.jpeg',
    serviceId: 4,
    subServiceId: 50,
    order: 56,
    price: 10000 * 100,
  },
  {
    name: 'Interlocking/crotcheting maintenance & Styling',
    photoUrl:
      'https://hairsap.fra1.cdn.digitaloceanspaces.com/subservicephoto/43.jpeg',
    serviceId: 4,
    subServiceId: 43,
    order: 57,
    price: 15000 * 100,
  },
  {
    name: 'Color tint',
    info: 'Black & bleach custom color. Customers will be responsible for an alternative dye color',
    photoUrl:
      'https://hairsap.fra1.cdn.digitaloceanspaces.com/subservicephoto/44.jpeg',
    serviceId: 4,
    subServiceId: 44,
    order: 58,
    price: 5000 * 100,
  },
  {
    name: 'Locs takedown',
    photoUrl:
      'https://hairsap.fra1.cdn.digitaloceanspaces.com/subservicephoto/45.jpeg',
    serviceId: 4,
    subServiceId: 45,
    order: 59,
    price: 50000 * 100,
  },
]

const proServiceData: Prisma.ProServiceCreateManyInput[] = [
  {
    serviceId: 1,
    proId: 4,
  },
]

const chatData: Prisma.ChatCreateManyInput[] = [
  {
    message: 'Hi1',
    messageType: 'text',
    receiverId: 2,
    senderId: 1,
  },
  {
    message: 'Hi2',
    messageType: 'text',
    receiverId: 1,
    senderId: 2,
  },
  {
    message: 'Hello1',
    messageType: 'text',
    receiverId: 2,
    senderId: 1,
  },
  {
    message: 'Hello2',
    messageType: 'text',
    receiverId: 1,
    senderId: 2,
  },
  {
    message: 'Hey3',
    messageType: 'text',
    receiverId: 1,
    senderId: 3,
  },
  {
    message: 'Hey3',
    messageType: 'text',
    receiverId: 2,
    senderId: 3,
  },
  {
    message: 'Hey3',
    messageType: 'text',
    receiverId: 3,
    senderId: 2,
  },
]

const discountData: Prisma.DiscountCreateManyInput[] = Object.values(
  DISCOUNT,
).map((value) => ({
  name: value,
}))

const marketerData: Prisma.MarketerCreateManyInput[] = [
  {
    name: 'Alfie',
    marketerId: 1,
  },
]

const promoData: Prisma.PromoCreateManyInput[] = [
  {
    active: true,
    code: 'ALFIE100',
    discountId: 1,
    marketerId: 1,
  },
]

async function main() {
  logger.info(`Start seeding ...`)

  let x: PrismaPromise<any>[] = [
    prisma.user.create({
      data: {
        address: 'no 1',
        email: 'admin@gmail.com',
        name: 'Admin',
        role: 'admin',
        userId: 1,
        password: 'scribd',
        phone: '',
      },
    }),
    prisma.service.createMany({
      data: serviceData,
    }),
    prisma.subService.createMany({
      data: [
        ...subServiceBraids,
        ...subServiceStyling,
        ...subServiceBarbing,
        ...subServiceLocks,
      ],
    }),
    prisma.discount.createMany({
      data: discountData,
    }),
  ]
  if (process.env.NODE_ENV === 'development') {
    x = x.concat([
      prisma.user.createMany({
        data: userData,
      }),
      prisma.chat.createMany({
        data: chatData,
      }),
      prisma.proService.createMany({
        data: proServiceData,
      }),
      prisma.marketer.createMany({
        data: marketerData,
      }),
      prisma.promo.createMany({
        data: promoData,
      }),
    ])
  }

  const subServices = [
    ...subServiceBraids,
    ...subServiceStyling,
    ...subServiceBarbing,
    ...subServiceLocks,
  ]

  await prisma.$transaction(
    subServices
      .filter((e) => [64, 65, 66, 67].includes(e.subServiceId!))
      .map((e) =>
        prisma.subService.update({
          where: {
            subServiceId: e.subServiceId,
          },
          data: e,
        }),
      ),
  )
  // await prisma.$transaction(x)

  logger.info(`Seeding finished.`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    logger.err(e)
    await prisma.$disconnect()
    process.exit(1)
  })
