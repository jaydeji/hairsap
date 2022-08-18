import { PrismaClient } from '@prisma/client'
import makeBookRepo from './book'
import makeChatRepo from './chat'
import makeProRepo from './pro'
import makeUserRepo from './user'
import makeOtherRepo from './other'
import makeAuthRepo from './auth'

const makeRepo = ({ db }: { db: PrismaClient }) => {
  return {
    user: makeUserRepo({ db }),
    chat: makeChatRepo({ db }),
    pro: makeProRepo({ db }),
    book: makeBookRepo({ db }),
    other: makeOtherRepo({ db }),
    auth: makeAuthRepo({ db }),
  }
}

export default makeRepo
