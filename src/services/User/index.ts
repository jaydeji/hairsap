import { z } from 'zod'
import {
  GetAllUsersReq,
  GetAllUsersReqSchema,
} from '../../schemas/request/getAllUsers'
import {
  GetUserSubscriptionsReq,
  GetUserSubscriptionsReqSchema,
} from '../../schemas/request/getUserSubscriptions'
import { PageReq } from '../../schemas/request/Page'
import {
  PatchUserRequest,
  PatchUserRequestSchema,
} from '../../schemas/request/patchUser'
import {
  PostSubscribeReq,
  PostSubscribeReqSchema,
} from '../../schemas/request/postSubscribe'
import {
  PostUploadUserProfilePhotoReq,
  PostUploadUserProfilePhotoReqSchema,
} from '../../schemas/request/postUploadProfilePhoto'
import type { Repo, Role } from '../../types'
import { getPageMeta, paginate } from '../../utils'
import { ForbiddenError, ValidationError } from '../../utils/Error'
import { Queue } from '../Queue'

const updateUser =
  ({ repo }: { repo: Repo }) =>
  async (userId: number, role: Role, body: PatchUserRequest) => {
    PatchUserRequestSchema.parse({ ...body, userId: userId })
    if (body.phone) {
      const userWithPhone = await repo.user.getUserByPhone(body.phone)
      if (userWithPhone && userWithPhone.userId !== userId)
        throw new ForbiddenError('user with phone number already exists')
    }
    if (body.email) {
      const emailUser = await repo.user.getUserByEmailAndRole(body.email, role)
      if (emailUser)
        throw new ValidationError('user with this email already exists')
    }
    await repo.user.updateUser(userId, body)
  }

const subscribe =
  ({ repo, queue }: { repo: Repo; queue: Queue }) =>
  async (body: PostSubscribeReq) => {
    PostSubscribeReqSchema.parse(body)
    const subscription = await repo.user.getSubscription(body)
    if (subscription) throw new ForbiddenError('user already subscribed')
    await repo.user.subscribe(body)
    queue.notifyQueue.add({
      userId: body.proId,
      title: 'New subscriber',
      body: 'You have gained a new subscriber',
      type: 'general',
    })
    return
  }

const unsubscribe =
  ({ repo }: { repo: Repo }) =>
  async (body: PostSubscribeReq) => {
    PostSubscribeReqSchema.parse(body)
    const subscription = await repo.user.getSubscription(body)
    if (!subscription) throw new ForbiddenError('user not subscribed')
    await repo.user.unsubscribe(body)
    return
  }

const getUserSubscriptions =
  ({ repo }: { repo: Repo }) =>
  async (body: GetUserSubscriptionsReq) => {
    GetUserSubscriptionsReqSchema.parse(body)
    return await repo.user.getUserSubscriptions(body.userId)
  }

const uploadProfilePhoto =
  ({ repo }: { repo: Repo }) =>
  async (body: PostUploadUserProfilePhotoReq) => {
    PostUploadUserProfilePhotoReqSchema.parse(body)

    const {
      userId,
      profilePhotoKey,
      profilePhotoOriginalFileName,
      profilePhotoUrl,
    } = body

    await repo.user.updateUser(userId, {
      profilePhotoKey,
      profilePhotoOriginalFileName,
      profilePhotoUrl,
    })
  }

const getAllUsers =
  ({ repo }: { repo: Repo }) =>
  async (body: GetAllUsersReq & PageReq) => {
    GetAllUsersReqSchema.parse(body)

    const { perPage, page } = body

    const _page = paginate({ perPage, page })

    const [total, data] = await repo.user.getAllUsers({
      ...body,
      skip: _page.skip,
    })
    const meta = getPageMeta({
      ..._page,
      total,
    })

    return { meta, data }
  }

const getUserDetails =
  ({ repo }: { repo: Repo }) =>
  async (body: { userId: number }) => {
    z.object({ userId: z.number() }).strict().parse(body)

    const { totalBookings, subscriptions, averageRatings, amountSpent, user } =
      await repo.user.getUserDetails(body)

    return { totalBookings, subscriptions, averageRatings, amountSpent, user }
  }

const getUserData =
  ({ repo }: { repo: Repo }) =>
  async (body: { userId: number }) => {
    z.object({ userId: z.number() }).strict().parse(body)

    const data = await repo.user.getUserData(body)

    return data
  }

const getCard =
  ({ repo }: { repo: Repo }) =>
  async (body: { userId: number }) => {
    z.object({ userId: z.number() }).strict().parse(body)

    const data = await repo.user.getCard(body)
    if (!data) return

    return {
      cardId: data.cardId,
      bank: data.bank,
      last4: data.last4,
      brand: data.brand,
      createdAt: data.createdAt,
    }
  }

const makeUser = ({ repo, queue }: { repo: Repo; queue: Queue }) => {
  return {
    updateUser: updateUser({ repo }),
    subscribe: subscribe({ repo, queue }),
    unsubscribe: unsubscribe({ repo }),
    getUserSubscriptions: getUserSubscriptions({ repo }),
    uploadProfilePhoto: uploadProfilePhoto({ repo }),
    getAllUsers: getAllUsers({ repo }),
    getUserDetails: getUserDetails({ repo }),
    getUserData: getUserData({ repo }),
    getCard: getCard({ repo }),
  }
}

export default makeUser
