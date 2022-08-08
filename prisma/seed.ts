import { PrismaClient, Prisma } from '@prisma/client'
import { logger } from '../src/utils'

const prisma = new PrismaClient()

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

async function main() {
  logger.info(`Start seeding ...`)

  await prisma.service.createMany({
    data: serviceData,
  })

  await prisma.subService.createMany({
    data: subServiceData,
  })

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
