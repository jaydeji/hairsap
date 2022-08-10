import { PrismaClient } from '@prisma/client'
import makeChatRepo from './chat'
import makeUserRepo from './user'

const makeRepo = ({ db }: { db: PrismaClient }) => {
  return {
    user: makeUserRepo({ db }),
    chat: makeChatRepo({ db }),
  }
}

export default makeRepo
