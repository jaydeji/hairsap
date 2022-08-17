import { Prisma, PrismaClient } from '@prisma/client'

const getAdminById =
  ({ db }: { db: PrismaClient }) =>
  (adminId: number) => {
    return db.admin.findUnique({
      where: {
        adminId,
      },
      include: {
        otp: true,
      },
    })
  }

const getAdminByEmail =
  ({ db }: { db: PrismaClient }) =>
  (email: string) => {
    return db.admin.findUnique({
      where: {
        email,
      },
    })
  }

const updateAdmin =
  ({ db }: { db: PrismaClient }) =>
  (adminId: number, admin: Prisma.AdminUpdateInput) =>
    db.admin.update({
      data: admin,
      where: {
        adminId,
      },
    })

const makeAdminRepo = ({ db }: { db: PrismaClient }) => {
  return {
    getAdminById: getAdminById({ db }),
    getAdminByEmail: getAdminByEmail({ db }),
    updateAdmin: updateAdmin({ db }),
  }
}

export default makeAdminRepo
