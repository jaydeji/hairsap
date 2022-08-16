import { PrismaClient } from '@prisma/client'
import makeBookRepo from './book'
import makeChatRepo from './chat'
import makeProRepo from './pro'
import makeUserRepo from './user'
import makeOtherRepo from './other'

const makeRepo = ({ db }: { db: PrismaClient }) => {
  return {
    user: makeUserRepo({ db }),
    chat: makeChatRepo({ db }),
    pro: makeProRepo({ db }),
    book: makeBookRepo({ db }),
    other: makeOtherRepo({ db }),
  }
}

export default makeRepo
