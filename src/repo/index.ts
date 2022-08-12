import { PrismaClient } from '@prisma/client'
import makeBookRepo from './book'
import makeChatRepo from './chat'
import makeProRepo from './pro'
import makeUserRepo from './user'

const makeRepo = ({ db }: { db: PrismaClient }) => {
  return {
    user: makeUserRepo({ db }),
    chat: makeChatRepo({ db }),
    pro: makeProRepo({ db }),
    book: makeBookRepo({ db }),
  }
}

export default makeRepo
