import { PrismaClient, Prisma } from '@prisma/client'
import { logger } from '../src/utils'

const prisma = new PrismaClient({
  log: ['query', 'error'],
})

const serviceData: Prisma.ServiceCreateManyInput[] = [
  {
    name: 'Barber',
    photoUrl: '',
    serviceId: 1,
  },
  {
    name: 'Stylist',
    photoUrl: '',
    serviceId: 2,
  },
  {
    name: 'Braider',
    photoUrl: '',
    serviceId: 3,
  },
  {
    name: 'Loctician',
    photoUrl: '',
    serviceId: 4,
  },
]

const subServiceData: Prisma.SubServiceCreateManyInput[] = [
  {
    name: 'Lock',
    photoUrl: '',
    serviceId: 1,
  },
]

const userData: Prisma.UserCreateManyInput[] = [
  {
    address: null,
    email: 'jideadedejifirst@gmail.com',
    name: 'Jide Adedeji',
    photoUrl: null,
    role: 'user',
    userId: 1,
    password:
      'e6f05048fbd74322097eb596700ce2357d9aed2db4b9772dec61f17bd4fa5a95',
    phone: '+2348118161237',
  },
  {
    address: null,
    email: 'topeadedejifirst@gmail.com',
    name: 'Tope Adedeji',
    photoUrl: null,
    role: 'user',
    userId: 2,
    password:
      'e6f05048fbd74322097eb596700ce2357d9aed2db4b9772dec61f17bd4fa5a95',
    phone: '+2348118161237',
  },
  {
    address: null,
    email: 'jamesadedejifirst@gmail.com',
    name: 'James Adedeji',
    photoUrl: null,
    role: 'pro',
    userId: 3,
    password:
      'e6f05048fbd74322097eb596700ce2357d9aed2db4b9772dec61f17bd4fa5a95',
    phone: '+2348118161237',
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
      data: subServiceData,
    }),
    prisma.chat.createMany({
      data: chatData,
    }),
    prisma.device.createMany({
      data: [{ userId: 1, value: 'jide_phone' }],
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
