import 'dotenv/config'
import { PrismaClient, Prisma, PrismaPromise } from '@prisma/client'
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
    photoUrl:
      'https://hairsap.fra1.cdn.digitaloceanspaces.com/servicePhoto/1.jpeg',
    serviceId: 1,
    subServiceId: 1,
    price: 25000 * 100,
  },
  {
    name: 'Knotless braids Medium',
    photoUrl:
      'https://hairsap.fra1.cdn.digitaloceanspaces.com/servicePhoto/2.jpeg',
    serviceId: 1,
    subServiceId: 2,
    price: 30000 * 100,
  },
  {
    name: 'Knotless braids Small',
    photoUrl:
      'https://hairsap.fra1.cdn.digitaloceanspaces.com/servicePhoto/3.jpeg',
    serviceId: 1,
    subServiceId: 3,
    price: 35000 * 100,
  },
  {
    name: 'Micro braids',
    photoUrl:
      'https://hairsap.fra1.cdn.digitaloceanspaces.com/servicePhoto/4.jpeg',
    serviceId: 1,
    subServiceId: 4,
    price: 50000 * 100,
  },
  {
    name: 'Goddess braids Large',
    photoUrl:
      'https://hairsap.fra1.cdn.digitaloceanspaces.com/servicePhoto/5.jpeg',
    serviceId: 1,
    subServiceId: 5,
    price: 25000 * 100,
  },
  {
    name: 'Goddess braids Medium',
    photoUrl:
      'https://hairsap.fra1.cdn.digitaloceanspaces.com/servicePhoto/6.jpeg',
    serviceId: 1,
    subServiceId: 6,
    price: 30000 * 100,
  },
  {
    name: 'Goddess braids Small',
    photoUrl:
      'https://hairsap.fra1.cdn.digitaloceanspaces.com/servicePhoto/7.jpeg',
    serviceId: 1,
    subServiceId: 7,
    price: 35000 * 100,
  },
  {
    name: 'Box braids Large',
    photoUrl:
      'https://hairsap.fra1.cdn.digitaloceanspaces.com/servicePhoto/8.jpeg',
    serviceId: 1,
    subServiceId: 8,
    price: 20000 * 100,
  },
  {
    name: 'Box braids Medium',
    photoUrl:
      'https://hairsap.fra1.cdn.digitaloceanspaces.com/servicePhoto/9.jpeg',
    serviceId: 1,
    subServiceId: 9,
    price: 25000 * 100,
  },
  {
    name: 'Box braids Small',
    photoUrl:
      'https://hairsap.fra1.cdn.digitaloceanspaces.com/servicePhoto/10.jpeg',
    serviceId: 1,
    subServiceId: 10,
    price: 30000 * 100,
  },
  {
    name: 'All types of Twist Large',
    photoUrl:
      'https://hairsap.fra1.cdn.digitaloceanspaces.com/servicePhoto/11.jpeg',
    serviceId: 1,
    subServiceId: 11,
    price: 25000 * 100,
  },
  {
    name: 'All types of Twist Medium',
    photoUrl:
      'https://hairsap.fra1.cdn.digitaloceanspaces.com/servicePhoto/12.jpeg',
    serviceId: 1,
    subServiceId: 12,
    price: 30000 * 100,
  },
  {
    name: 'All types of Twist Small',
    photoUrl:
      'https://hairsap.fra1.cdn.digitaloceanspaces.com/servicePhoto/13.jpeg',
    serviceId: 1,
    subServiceId: 13,
    price: 35000 * 100,
  },
  {
    name: 'Stitch braids cornrow (6-8 stitches)',
    photoUrl:
      'https://hairsap.fra1.cdn.digitaloceanspaces.com/servicePhoto/14.jpeg',
    serviceId: 1,
    subServiceId: 14,
    price: 15000 * 100,
  },
  {
    name: 'Stitch braids cornrow (10-14 stitches)',
    photoUrl:
      'https://hairsap.fra1.cdn.digitaloceanspaces.com/servicePhoto/15.jpeg',
    serviceId: 1,
    subServiceId: 15,
    price: 20000 * 100,
  },
  {
    name: 'Stitch braids cornrow (14+ stitches)',
    photoUrl:
      'https://hairsap.fra1.cdn.digitaloceanspaces.com/servicePhoto/16.jpeg',
    serviceId: 1,
    subServiceId: 16,
    price: 25000 * 100,
  },
  {
    name: 'Stitch braids with design',
    photoUrl:
      'https://hairsap.fra1.cdn.digitaloceanspaces.com/servicePhoto/17.jpeg',
    serviceId: 1,
    subServiceId: 17,
    price: 20000 * 100,
  },
  {
    name: 'Butterly/Faux Locs Large',
    photoUrl:
      'https://hairsap.fra1.cdn.digitaloceanspaces.com/servicePhoto/18.jpeg',
    serviceId: 1,
    subServiceId: 18,
    price: 25000 * 100,
  },
  {
    name: 'Butterly/Faux Locs Medium',
    photoUrl:
      'https://hairsap.fra1.cdn.digitaloceanspaces.com/servicePhoto/19.jpeg',
    serviceId: 1,
    subServiceId: 19,
    price: 30000 * 100,
  },
  {
    name: 'Butterly/Faux Locs Small',
    photoUrl:
      'https://hairsap.fra1.cdn.digitaloceanspaces.com/servicePhoto/20.jpeg',
    serviceId: 1,
    subServiceId: 20,
    price: 35000 * 100,
  },
  {
    name: 'Cornrow Lemonade braids',
    photoUrl:
      'https://hairsap.fra1.cdn.digitaloceanspaces.com/servicePhoto/21.jpeg',
    serviceId: 1,
    subServiceId: 21,
    price: 20000 * 100,
  },
  {
    name: '14+ Regular all back cornrow',
    photoUrl:
      'https://hairsap.fra1.cdn.digitaloceanspaces.com/servicePhoto/22.jpeg',
    serviceId: 1,
    subServiceId: 22,
    price: 25000 * 100,
  },
  {
    name: '6-8 Cornrow braids',
    photoUrl:
      'https://hairsap.fra1.cdn.digitaloceanspaces.com/servicePhoto/23.jpeg',
    serviceId: 1,
    subServiceId: 23,
    price: 15000 * 100,
  },
  {
    name: 'Criss cross braids',
    photoUrl:
      'https://hairsap.fra1.cdn.digitaloceanspaces.com/servicePhoto/24.jpeg',
    serviceId: 1,
    subServiceId: 24,
    price: 20000 * 100,
  },
  {
    name: 'Illusion Crotchet',
    photoUrl:
      'https://hairsap.fra1.cdn.digitaloceanspaces.com/servicePhoto/25.jpeg',
    serviceId: 1,
    subServiceId: 25,
    price: 20000 * 100,
  },
  {
    name: 'Chunky bun',
    photoUrl:
      'https://hairsap.fra1.cdn.digitaloceanspaces.com/servicePhoto/26.jpeg',
    serviceId: 1,
    subServiceId: 26,
    price: 15000 * 100,
  },
  {
    name: 'Color tint and highlight',
    photoUrl:
      'https://hairsap.fra1.cdn.digitaloceanspaces.com/servicePhoto/27.jpeg',
    serviceId: 1,
    subServiceId: 27,
    price: 10000 * 100,
  },
  {
    name: 'Braids takedown',
    photoUrl:
      'https://hairsap.fra1.cdn.digitaloceanspaces.com/servicePhoto/28.jpeg',
    serviceId: 1,
    subServiceId: 28,
    price: 10000 * 100,
  },
]

const subServiceStyling: Prisma.SubServiceCreateManyInput[] = [
  {
    name: '360 Frontal installation & styling',
    photoUrl:
      'https://hairsap.fra1.cdn.digitaloceanspaces.com/servicePhoto/29.jpeg',
    serviceId: 2,
    subServiceId: 29,
    price: 30000 * 100,
  },
  {
    name: 'Frontal installation & styling',
    photoUrl:
      'https://hairsap.fra1.cdn.digitaloceanspaces.com/servicePhoto/30.jpeg',
    serviceId: 2,
    subServiceId: 30,
    price: 25000 * 100,
  },
  {
    name: 'Closure installation & styling',
    photoUrl:
      'https://hairsap.fra1.cdn.digitaloceanspaces.com/servicePhoto/31.jpeg',
    serviceId: 2,
    subServiceId: 31,
    price: 20000 * 100,
  },
  {
    name: 'Frontal ponytail',
    photoUrl:
      'https://hairsap.fra1.cdn.digitaloceanspaces.com/servicePhoto/32.jpeg',
    serviceId: 2,
    subServiceId: 32,
    price: 20000 * 100,
  },
  {
    name: 'Gel ponytail',
    photoUrl:
      'https://hairsap.fra1.cdn.digitaloceanspaces.com/servicePhoto/33.jpeg',
    serviceId: 2,
    subServiceId: 33,
    price: 15000 * 100,
  },
  {
    name: 'Natural hair Coloring/Highlight & styling',
    photoUrl:
      'https://hairsap.fra1.cdn.digitaloceanspaces.com/servicePhoto/34.jpeg',
    serviceId: 2,
    subServiceId: 34,
    price: 20000 * 100,
  },
  {
    name: 'Hair trim/cut & styling',
    photoUrl:
      'https://hairsap.fra1.cdn.digitaloceanspaces.com/servicePhoto/35.jpeg',
    serviceId: 2,
    subServiceId: 35,
    price: 15000 * 100,
  },
  {
    name: 'Natural hair Blowout/Treatment & styling',
    photoUrl:
      'https://hairsap.fra1.cdn.digitaloceanspaces.com/servicePhoto/36.jpeg',
    serviceId: 2,
    subServiceId: 36,
    price: 20000 * 100,
  },
  {
    name: 'Bridal styling',
    photoUrl:
      'https://hairsap.fra1.cdn.digitaloceanspaces.com/servicePhoto/37.jpeg',
    serviceId: 2,
    subServiceId: 37,
    price: 50000 * 100,
  },
]

const subServiceBarbing: Prisma.SubServiceCreateManyInput[] = [
  {
    name: 'Haircut',
    photoUrl:
      'https://hairsap.fra1.cdn.digitaloceanspaces.com/servicePhoto/38.jpeg',
    serviceId: 3,
    subServiceId: 38,
    price: 15000 * 100,
  },
  {
    name: 'Beard shaving',
    photoUrl:
      'https://hairsap.fra1.cdn.digitaloceanspaces.com/servicePhoto/39.jpeg',
    serviceId: 3,
    subServiceId: 39,
    price: 10000 * 100,
  },
  {
    name: 'Color tint',
    photoUrl:
      'https://hairsap.fra1.cdn.digitaloceanspaces.com/servicePhoto/40.jpeg',
    serviceId: 3,
    subServiceId: 40,
    price: 10000 * 100,
  },
]

const subServiceLocks: Prisma.SubServiceCreateManyInput[] = [
  {
    name: 'Instant starter locs (Small size)',
    photoUrl:
      'https://hairsap.fra1.cdn.digitaloceanspaces.com/servicePhoto/41.jpeg',
    serviceId: 4,
    subServiceId: 41,
    price: 40000 * 100,
  },
  {
    name: 'Starter Locs',
    photoUrl:
      'https://hairsap.fra1.cdn.digitaloceanspaces.com/servicePhoto/42.jpeg',
    serviceId: 4,
    subServiceId: 42,
    price: 25000 * 100,
  },
  {
    name: 'Loc styling/maintenance',
    photoUrl:
      'https://hairsap.fra1.cdn.digitaloceanspaces.com/servicePhoto/43.jpeg',
    serviceId: 4,
    subServiceId: 43,
    price: 15000 * 100,
  },
  {
    name: 'Color tint and highlight',
    photoUrl:
      'https://hairsap.fra1.cdn.digitaloceanspaces.com/servicePhoto/44.jpeg',
    serviceId: 4,
    subServiceId: 44,
    price: 10000 * 100,
  },
  {
    name: 'Locs takedown (Above shoulder length)',
    photoUrl:
      'https://hairsap.fra1.cdn.digitaloceanspaces.com/servicePhoto/45.jpeg',
    serviceId: 4,
    subServiceId: 45,
    price: 40000 * 100,
  },
  {
    name: 'Sister Locs',
    photoUrl:
      'https://hairsap.fra1.cdn.digitaloceanspaces.com/servicePhoto/46.jpeg',
    serviceId: 4,
    subServiceId: 46,
    price: 50000 * 100,
  },
  {
    name: 'Instant starter locs (Normal size)',
    photoUrl:
      'https://hairsap.fra1.cdn.digitaloceanspaces.com/servicePhoto/47.jpeg',
    serviceId: 4,
    subServiceId: 47,
    price: 35000 * 100,
  },
  {
    name: 'Instant starter locs (Jumbo size)',
    photoUrl:
      'https://hairsap.fra1.cdn.digitaloceanspaces.com/servicePhoto/48.jpeg',
    serviceId: 4,
    subServiceId: 48,
    price: 30000 * 100,
  },
  {
    name: 'Locs takedown (Below shoulder length)',
    photoUrl:
      'https://hairsap.fra1.cdn.digitaloceanspaces.com/servicePhoto/49.jpeg',
    serviceId: 4,
    subServiceId: 49,
    price: 50000 * 100,
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

  let x: PrismaPromise<any>[] = [
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
    ])
  }

  await prisma.$transaction(x)

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
