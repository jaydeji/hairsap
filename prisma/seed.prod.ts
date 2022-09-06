import { PrismaClient, Prisma } from '@prisma/client'
import { logger } from '../src/utils'

const prisma = new PrismaClient({
  log: ['query', 'error'],
})

const userData: Prisma.UserCreateManyInput[] = [
  {
    address: 'no 4',
    email: 'admin@gmail.com',
    name: 'Admin',
    role: 'admin',
    userId: 1,
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
    price: 25000 * 100,
  },
  {
    name: 'Knotless braids Medium',
    photoUrl: '',
    serviceId: 1,
    subServiceId: 2,
    price: 30000 * 100,
  },
  {
    name: 'Knotless braids Small',
    photoUrl: '',
    serviceId: 1,
    subServiceId: 3,
    price: 35000 * 100,
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
    price: 25000 * 100,
  },
  {
    name: 'Goddess braids Medium',
    photoUrl: '',
    serviceId: 1,
    subServiceId: 6,
    price: 30000 * 100,
  },
  {
    name: 'Goddess braids Small',
    photoUrl: '',
    serviceId: 1,
    subServiceId: 7,
    price: 35000 * 100,
  },
  {
    name: 'Box braids Large',
    photoUrl: '',
    serviceId: 1,
    subServiceId: 8,
    price: 20000 * 100,
  },
  {
    name: 'Box braids Medium',
    photoUrl: '',
    serviceId: 1,
    subServiceId: 9,
    price: 25000 * 100,
  },
  {
    name: 'Box braids Small',
    photoUrl: '',
    serviceId: 1,
    subServiceId: 10,
    price: 30000 * 100,
  },
  {
    name: 'All types of Twist Large',
    photoUrl: '',
    serviceId: 1,
    subServiceId: 11,
    price: 25000 * 100,
  },
  {
    name: 'All types of Twist Medium',
    photoUrl: '',
    serviceId: 1,
    subServiceId: 12,
    price: 30000 * 100,
  },
  {
    name: 'All types of Twist Small',
    photoUrl: '',
    serviceId: 1,
    subServiceId: 13,
    price: 35000 * 100,
  },
  {
    name: 'Stitch braids cornrow (6-8 stitches)',
    photoUrl: '',
    serviceId: 1,
    subServiceId: 14,
    price: 15000 * 100,
  },
  {
    name: 'Stitch braids cornrow (10-14 stitches)',
    photoUrl: '',
    serviceId: 1,
    subServiceId: 15,
    price: 20000 * 100,
  },
  {
    name: 'Stitch braids cornrow (14+ stitches)',
    photoUrl: '',
    serviceId: 1,
    subServiceId: 16,
    price: 25000 * 100,
  },
  {
    name: 'Stitch braids with design',
    photoUrl: '',
    serviceId: 1,
    subServiceId: 17,
    price: 20000 * 100,
  },
  {
    name: 'Butterly/Faux Locs Large',
    photoUrl: '',
    serviceId: 1,
    subServiceId: 18,
    price: 25000 * 100,
  },
  {
    name: 'Butterly/Faux Locs Medium',
    photoUrl: '',
    serviceId: 1,
    subServiceId: 19,
    price: 30000 * 100,
  },
  {
    name: 'Butterly/Faux Locs Small',
    photoUrl: '',
    serviceId: 1,
    subServiceId: 20,
    price: 35000 * 100,
  },
  {
    name: 'Lemonade braids',
    photoUrl: '',
    serviceId: 1,
    subServiceId: 21,
    price: 20000 * 100,
  },
  {
    name: '14+ Regular all back cornrow',
    photoUrl: '',
    serviceId: 1,
    subServiceId: 22,
    price: 25000 * 100,
  },
  {
    name: '6-8 Cornrow braids',
    photoUrl: '',
    serviceId: 1,
    subServiceId: 23,
    price: 15000 * 100,
  },
  {
    name: 'Criss cross braids',
    photoUrl: '',
    serviceId: 1,
    subServiceId: 24,
    price: 20000 * 100,
  },
  {
    name: 'Illusion Crotchet',
    photoUrl: '',
    serviceId: 1,
    subServiceId: 25,
    price: 20000 * 100,
  },
  {
    name: 'Chunky bun',
    photoUrl: '',
    serviceId: 1,
    subServiceId: 26,
    price: 15000 * 100,
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
    serviceId: 2,
    subServiceId: 29,
    price: 30000 * 100,
  },
  {
    name: 'Frontal installation & styling',
    photoUrl: '',
    serviceId: 2,
    subServiceId: 30,
    price: 25000 * 100,
  },
  {
    name: 'Closure installation & styling',
    photoUrl: '',
    serviceId: 2,
    subServiceId: 31,
    price: 20000 * 100,
  },
  {
    name: 'Frontal ponytail',
    photoUrl: '',
    serviceId: 2,
    subServiceId: 32,
    price: 20000 * 100,
  },
  {
    name: 'Gel ponytail',
    photoUrl: '',
    serviceId: 2,
    subServiceId: 33,
    price: 15000 * 100,
  },
  {
    name: 'Natural hair Coloring/Highlight & styling',
    photoUrl: '',
    serviceId: 2,
    subServiceId: 34,
    price: 20000 * 100,
  },
  {
    name: 'Hair trim/cut & styling',
    photoUrl: '',
    serviceId: 2,
    subServiceId: 35,
    price: 15000 * 100,
  },
  {
    name: 'Natural hair Blowout/Treatment & styling',
    photoUrl: '',
    serviceId: 2,
    subServiceId: 36,
    price: 20000 * 100,
  },
  {
    name: 'Bridal styling',
    photoUrl: '',
    serviceId: 2,
    subServiceId: 37,
    price: 40000 * 100,
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
    name: 'Instant starter locs (Small size)',
    photoUrl: '',
    serviceId: 1,
    subServiceId: 41,
    price: 40000 * 100,
  },
  {
    name: 'Starter Locs',
    photoUrl: '',
    serviceId: 1,
    subServiceId: 42,
    price: 25000 * 100,
  },
  {
    name: 'Loc styling/maintenance',
    photoUrl: '',
    serviceId: 1,
    subServiceId: 43,
    price: 15000 * 100,
  },
  {
    name: 'Color tint and highlight',
    photoUrl: '',
    serviceId: 1,
    subServiceId: 44,
    price: 10000 * 100,
  },
  {
    name: 'Locs takedown (Above shoulder length)',
    photoUrl: '',
    serviceId: 1,
    subServiceId: 45,
    price: 30000 * 100,
  },
  {
    name: 'Sister Locs',
    photoUrl: '',
    serviceId: 1,
    subServiceId: 46,
    price: 45000 * 100,
  },
  {
    name: 'Instant starter locs (Normal size)',
    photoUrl: '',
    serviceId: 1,
    subServiceId: 47,
    price: 35000 * 100,
  },
  {
    name: 'Instant starter locs (Jumbo size)',
    photoUrl: '',
    serviceId: 1,
    subServiceId: 48,
    price: 30000 * 100,
  },
  {
    name: 'Locs takedown (Below shoulder length)',
    photoUrl: '',
    serviceId: 1,
    subServiceId: 49,
    price: 35000 * 100,
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
