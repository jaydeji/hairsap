import { Cursor } from '../../schemas/models/Cursor'
import { GetChatByIdReqSchema } from '../../schemas/request/getChatById'
import type { Repo } from '../../types'

const getChatList =
  ({ repo }: { repo: Repo }) =>
  async (userId: number) => {
    const chats = await repo.chat.getChatList(userId)
    return { chats }
  }

const getChatById =
  ({ repo }: { repo: Repo }) =>
  async (data: { userId: number; otherUserId: number } & Cursor) => {
    GetChatByIdReqSchema.parse(data)
    const chats = await repo.chat.getChatById(data)
    return { chats }
  }

const makeChat = ({ repo }: { repo: Repo }) => {
  return {
    getChatList: getChatList({ repo }),
    getChatById: getChatById({ repo }),
  }
}

export default makeChat
