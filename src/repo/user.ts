import { Prisma, PrismaClient, Role } from '@prisma/client'

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

const getUserByEmailandRole = ({
  email,
  role,
  db,
}: {
  db: PrismaClient
  email: string
  role: Role
}) => {
  return db.user.findUnique({
    where: {
      email,
      role,
    },
  })
}

const createUser = ({
  user,
  db,
}: {
  db: PrismaClient
  user: Prisma.UserCreateInput
}) => db.user.create({ data: user })

const makeUserRepo = ({ db }: { db: PrismaClient }) => {
  return {
    getUserByEmail: (email: string) => getUserByEmail({ db, email }),
    getUserByEmailandRole: (email: string, role: Role) =>
      getUserByEmailandRole({ db, email, role }),
    createUser: (user: Prisma.UserCreateInput) => createUser({ user, db }),
  }
}

export default makeUserRepo
