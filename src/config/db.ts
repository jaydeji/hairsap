import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query'] : [],
  // errorFormat: 'minimal',
})

// Some bug with Prisma and BigInt... https://github.com/prisma/studio/issues/614
export const patchPrisma = () => {
  // @ts-ignore: Unreachable code error                              <-- BigInt does not have `toJSON` method
  BigInt.prototype.toJSON = function () {
    // return this.toString()
    return Number(this)
  }
}

export default prisma
