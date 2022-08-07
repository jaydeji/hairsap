import { Prisma, PrismaClient } from '@prisma/client'
import { Role } from '../types'

const getUserById =
  ({ db }: { db: PrismaClient }) =>
  (userId: number) => {
    return db.user.findUnique({
      where: {
        userId,
      },
      include: {
        devices: true,
      },
    })
  }

const getUserByEmail = ({ email, db }: { db: PrismaClient; email: string }) => {
  return db.user.findUnique({
    where: {
      email,
    },
    include: {
      devices: true,
    },
  })
}

const getUserByEmailandRole = async ({
  email,
  role,
  db,
}: {
  db: PrismaClient
  email: string
  role: Role
}) => {
  const user = await db.user.findUnique({
    where: {
      email,
    },
  })

  return user?.role === role ? user : null
}

const createUser = ({
  user,
  db,
}: {
  db: PrismaClient
  user: Prisma.UserCreateInput
}) => db.user.create({ data: user })

const updateUser =
  ({ db }: { db: PrismaClient }) =>
  (user: Prisma.UserUpdateInput, userId: number) => {
    db.user.update({
      data: user,
      where: {
        userId: userId,
      },
    })
  }

const makeUserRepo = ({ db }: { db: PrismaClient }) => {
  return {
    getUserById: getUserById({ db }),
    getUserByEmail: (email: string) => getUserByEmail({ db, email }),
    getUserByEmailandRole: (email: string, role: Role) =>
      getUserByEmailandRole({ db, email, role }),
    createUser: (user: Prisma.UserCreateInput) => createUser({ user, db }),
    updateUser: updateUser({ db }),
  }
}

export default makeUserRepo
