import { z } from 'zod'
import { getChatImageSignedUrl } from '../../config/multer-cloud'
import { Cursor } from '../../schemas/models/Cursor'
import { GetChatByIdReqSchema } from '../../schemas/request/getChatById'
import type { Repo } from '../../types'
import { logger } from '../../utils'
import { InternalError } from '../../utils/Error'

const getChatList =
  ({ repo }: { repo: Repo }) =>
  async (userId: number) => {
    const chats = await repo.chat.getChatList(userId)
    return chats
  }

const getChatById =
  ({ repo }: { repo: Repo }) =>
  async (data: { userId: number; otherUserId: number } & Cursor) => {
    GetChatByIdReqSchema.parse(data)
    const chats = await repo.chat.getChatById(data)
    return chats
  }

//unused
const getChatImagePresignedUrl = async (body: { userId: number }) => {
  z.object({ userId: z.number() }).parse(body)
  try {
    const { url, fields } = await getChatImageSignedUrl(body)

    return {
      // originalFilename: filename,
      // uploadedDocumentUrl: `https://${process.env.S3_CHARGEBACK_DOCUMENTS_BUCKET_NAME}.s3.eu-central-1.amazonaws.com/${uniqueFilename}`,
      postUrl: url,
      fields: fields,
    }
  } catch (error) {
    logger.err(error)
    throw new InternalError()
  }
}

const makeChat = ({ repo }: { repo: Repo }) => {
  return {
    getChatList: getChatList({ repo }),
    getChatById: getChatById({ repo }),
    getChatImagePresignedUrl,
  }
}

export default makeChat
