import { PrismaClient, Prisma } from '@prisma/client'
import { logger } from '../src/utils'

const prisma = new PrismaClient({
  log: ['query', 'error'],
})

const userData: Prisma.UserCreateManyInput[] = [
  {
    address: 'no 1',
    email: 'jideadedejifirst@gmail.com',
    name: 'Jide Adedeji',
    profilePhotoUrl: null,
    role: 'user',
    userId: 1,
    password:
      'e6f05048fbd74322097eb596700ce2357d9aed2db4b9772dec61f17bd4fa5a95',
    phone: '+2348118161237',
    verified: true,
  },
  {
    address: 'no 2',
    email: 'topeadedejifirst@gmail.com',
    name: 'Tope Adedeji',
    profilePhotoUrl: null,
    role: 'user',
    userId: 2,
    password:
      'e6f05048fbd74322097eb596700ce2357d9aed2db4b9772dec61f17bd4fa5a95',
    phone: '+2348118161236',
    verified: true,
  },
  {
    address: 'no 3',
    email: 'jamesadedejifirst@gmail.com',
    name: 'James Adedeji',
    profilePhotoUrl: null,
    role: 'pro',
    userId: 3,
    password:
      'e6f05048fbd74322097eb596700ce2357d9aed2db4b9772dec61f17bd4fa5a95',
    phone: '+2348118161237',
    longitude: 3.372669140201567,
    latitude: 6.518572387441918,
    verified: true,
  },
  {
    address: 'no 4',
    email: 'admin@gmail.com',
    name: 'Admin',
    role: 'admin',
    userId: 4,
    password:
      'e6f05048fbd74322097eb596700ce2357d9aed2db4b9772dec61f17bd4fa5a95',
    phone: '+2348118161239',
  },
]

const serviceData: Prisma.ServiceCreateManyInput[] = [
  {
    name: 'Braiding',
    photoUrl: '',
    serviceId: 1,
  },
  {
    name: 'Styling',
    photoUrl: '',
    serviceId: 2,
  },
  {
    name: 'Barbing',
    photoUrl: '',
    serviceId: 3,
  },
  {
    name: 'Locs',
    photoUrl: '',
    serviceId: 4,
  },
]

const subServiceBraids: Prisma.SubServiceCreateManyInput[] = [
  {
    name: 'Knotless braids Large',
    photoUrl: '',
    serviceId: 1,
    subServiceId: 1,
    price: 20000 * 100,
  },
  {
    name: 'Knotless braids Medium',
    photoUrl: '',
    serviceId: 1,
    subServiceId: 2,
    price: 25000 * 100,
  },
  {
    name: 'Knotless braids Small',
    photoUrl: '',
    serviceId: 1,
    subServiceId: 3,
    price: 30000 * 100,
  },
  {
    name: 'Micro braids',
    photoUrl: '',
    serviceId: 1,
    subServiceId: 4,
    price: 40000 * 100,
  },
  {
    name: 'Goddess braids Large',
    photoUrl: '',
    serviceId: 1,
    subServiceId: 5,
    price: 20000 * 100,
  },
  {
    name: 'Goddess braids Medium',
    photoUrl: '',
    serviceId: 1,
    subServiceId: 6,
    price: 25000 * 100,
  },
  {
    name: 'Goddess braids Small',
    photoUrl: '',
    serviceId: 1,
    subServiceId: 7,
    price: 30000 * 100,
  },
  {
    name: 'Box braids Large',
    photoUrl: '',
    serviceId: 1,
    subServiceId: 8,
    price: 15000 * 100,
  },
  {
    name: 'Box braids Medium',
    photoUrl: '',
    serviceId: 1,
    subServiceId: 9,
    price: 20000 * 100,
  },
  {
    name: 'Box braids Small',
    photoUrl: '',
    serviceId: 1,
    subServiceId: 10,
    price: 25000 * 100,
  },
  {
    name: 'All types of Twist Large',
    photoUrl: '',
    serviceId: 1,
    subServiceId: 11,
    price: 20000 * 100,
  },
  {
    name: 'All types of Twist Medium',
    photoUrl: '',
    serviceId: 1,
    subServiceId: 12,
    price: 25000 * 100,
  },
  {
    name: 'All types of Twist Small',
    photoUrl: '',
    serviceId: 1,
    subServiceId: 13,
    price: 30000 * 100,
  },
  {
    name: 'Stitch braids cornrow (6-8 stitches)',
    photoUrl: '',
    serviceId: 1,
    subServiceId: 14,
    price: 10000 * 100,
  },
  {
    name: 'Stitch braids cornrow (10-14 stitches)',
    photoUrl: '',
    serviceId: 1,
    subServiceId: 15,
    price: 15000 * 100,
  },
  {
    name: 'Stitch braids cornrow (14+ stitches)',
    photoUrl: '',
    serviceId: 1,
    subServiceId: 16,
    price: 20000 * 100,
  },
  {
    name: 'Stitch braids with design',
    photoUrl: '',
    serviceId: 1,
    subServiceId: 17,
    price: 15000 * 100,
  },
  {
    name: 'Butterly/Faux Locs Large',
    photoUrl: '',
    serviceId: 1,
    subServiceId: 18,
    price: 20000 * 100,
  },
  {
    name: 'Butterly/Faux Locs Medium',
    photoUrl: '',
    serviceId: 1,
    subServiceId: 19,
    price: 25000 * 100,
  },
  {
    name: 'Butterly/Faux Locs Small',
    photoUrl: '',
    serviceId: 1,
    subServiceId: 20,
    price: 30000 * 100,
  },
  {
    name: 'Lemonade braids',
    photoUrl: '',
    serviceId: 1,
    subServiceId: 21,
    price: 15000 * 100,
  },
  {
    name: '14+ Regular all back cornrow',
    photoUrl: '',
    serviceId: 1,
    subServiceId: 22,
    price: 20000 * 100,
  },
  {
    name: '6-8 Cornrow braids',
    photoUrl: '',
    serviceId: 1,
    subServiceId: 23,
    price: 10000 * 100,
  },
  {
    name: 'Criss cross braids',
    photoUrl: '',
    serviceId: 1,
    subServiceId: 24,
    price: 15000 * 100,
  },
  {
    name: 'Illusion Crotchet',
    photoUrl: '',
    serviceId: 1,
    subServiceId: 25,
    price: 15000 * 100,
  },
  {
    name: 'Chunky bun',
    photoUrl: '',
    serviceId: 1,
    subServiceId: 26,
    price: 10000 * 100,
  },
  {
    name: 'Color tint and highlight',
    photoUrl: '',
    serviceId: 1,
    subServiceId: 27,
    price: 10000 * 100,
  },
  {
    name: 'Braids takedown',
    photoUrl: '',
    serviceId: 1,
    subServiceId: 28,
    price: 10000 * 100,
  },
]

const subServiceStyling: Prisma.SubServiceCreateManyInput[] = [
  {
    name: '360 Frontal installation & styling',
    photoUrl: '',
    serviceId: 3,
    subServiceId: 29,
    price: 25000 * 100,
  },
  {
    name: 'Frontal installation & styling',
    photoUrl: '',
    serviceId: 3,
    subServiceId: 30,
    price: 20000 * 100,
  },
  {
    name: 'Closure installation & styling',
    photoUrl: '',
    serviceId: 3,
    subServiceId: 31,
    price: 15000 * 100,
  },
  {
    name: 'Frontal ponytail',
    photoUrl: '',
    serviceId: 3,
    subServiceId: 32,
    price: 15000 * 100,
  },
  {
    name: 'Gel ponytail',
    photoUrl: '',
    serviceId: 3,
    subServiceId: 33,
    price: 10000 * 100,
  },
  {
    name: 'Natural hair Coloring/Highlight & styling',
    photoUrl: '',
    serviceId: 3,
    subServiceId: 34,
    price: 15000 * 100,
  },
  {
    name: 'Hair trim/cut & styling',
    photoUrl: '',
    serviceId: 3,
    subServiceId: 35,
    price: 10000 * 100,
  },
  {
    name: 'Natural hair Blowout/Treatment & styling',
    photoUrl: '',
    serviceId: 3,
    subServiceId: 36,
    price: 15000 * 100,
  },
  {
    name: 'Bridal styling',
    photoUrl: '',
    serviceId: 3,
    subServiceId: 37,
    price: 35000 * 100,
  },
]

const subServiceBarbing: Prisma.SubServiceCreateManyInput[] = [
  {
    name: 'Haircut',
    photoUrl: '',
    serviceId: 4,
    subServiceId: 38,
    price: 15000 * 100,
  },
  {
    name: 'Beard shaving',
    photoUrl: '',
    serviceId: 4,
    subServiceId: 39,
    price: 10000 * 100,
  },
  {
    name: 'Color tint',
    photoUrl: '',
    serviceId: 4,
    subServiceId: 40,
    price: 10000 * 100,
  },
]

const subServiceLocks: Prisma.SubServiceCreateManyInput[] = [
  {
    name: 'Instant starter locs',
    photoUrl: '',
    serviceId: 1,
    subServiceId: 41,
    price: 20000 * 100,
  },
  {
    name: 'Starter Locs',
    photoUrl: '',
    serviceId: 1,
    subServiceId: 42,
    price: 15000 * 100,
  },
  {
    name: 'Loc styling/maintenance',
    photoUrl: '',
    serviceId: 1,
    subServiceId: 43,
    price: 10000 * 100,
  },
  {
    name: 'Color tint and highlight',
    photoUrl: '',
    serviceId: 1,
    subServiceId: 44,
    price: 10000 * 100,
  },
  {
    name: 'Locs takedown',
    photoUrl: '',
    serviceId: 1,
    subServiceId: 45,
    price: 10000 * 100,
  },
]

const proServiceData: Prisma.ProServiceCreateManyInput[] = [
  {
    serviceId: 1,
    proId: 3,
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

async function main() {
  logger.info(`Start seeding ...`)

  await prisma.$transaction([
    prisma.user.createMany({
      data: userData,
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
    prisma.chat.createMany({
      data: chatData,
    }),
    prisma.proService.createMany({
      data: proServiceData,
    }),
  ])

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
