import { ROLES } from '../../config/constants'
import { hashPassword } from '../../utils'
import {
  PostLoginAdminRequest,
  PostLoginAdminRequestSchema,
  PostLoginProRequest,
  PostLoginProRequestSchema,
  PostLoginUserRequest,
  PostLoginUserRequestSchema,
} from '../../schemas/request/postLogin'
import type { Repo } from '../../types'
import { ForbiddenError } from '../../utils/Error'
import { PostLoginResponseSchema } from '../../schemas/response/postLogin'
import { generateJwt } from '../../utils/jwtLib'
import { hashPassword2 } from '../../utils/hashPassword'

const error = 'email or phone number or password incorrect'

const loginAdmin = async ({
  repo,
  body,
}: {
  repo: Repo
  body: PostLoginAdminRequest
}) => {
  PostLoginAdminRequestSchema.parse(body)

  let admin
  if (body.email)
    admin = await repo.user.getUserByEmailAndRole(body.email, body.role)
  if (body.phone)
    admin = await repo.user.getUserByPhoneAndRole(body.phone, body.role)

  if (!admin) throw new ForbiddenError(error)
  const hashedPassword = hashPassword(body.password)

  if (admin.password !== hashedPassword) {
    throw new ForbiddenError(error)
  }

  const token = generateJwt(
    { email: admin.email, role: admin.role, userId: admin.userId },
    true,
    // {
    //   expiresIn: String(dayjs.duration({ days: 7 }).as('ms')),
    // },
  )

  return { admin: PostLoginResponseSchema.parse(admin), token }
}

const loginUser = async ({
  repo,
  body,
}: {
  repo: Repo
  body: PostLoginUserRequest
}) => {
  PostLoginUserRequestSchema.parse(body)

  let user
  if (body.email)
    user = await repo.user.getUserByEmailAndRole(body.email, body.role)
  if (body.phone)
    user = await repo.user.getUserByPhoneAndRole(body.phone, body.role)

  if (!user) throw new ForbiddenError(error)
  const hashedPassword = hashPassword(body.password)
  const hashedPassword2 = hashPassword2(body.password)

  if (user.password !== hashedPassword && user.password !== hashedPassword2) {
    throw new ForbiddenError(error)
  }

  //update users password to use prod hash instead of staging
  if (user.password === hashedPassword2) {
    await repo.user.updateUser(user.userId, {
      password: hashedPassword,
      systemUpdPass: true,
    })
  }

  const token = generateJwt(
    { email: user.email, role: user.role, userId: user.userId },
    false,
    // {
    //   expiresIn: String(dayjs.duration({ days: 30 }).as('ms')),
    // },
  )

  return { user: PostLoginResponseSchema.parse(user), token }
}

const loginPro = async ({
  repo,
  body,
}: {
  repo: Repo
  body: PostLoginProRequest
}) => {
  PostLoginProRequestSchema.parse(body)

  let pro
  if (body.email)
    pro = await repo.user.getUserByEmailAndRole(body.email, body.role)
  if (body.phone)
    pro = await repo.user.getUserByPhoneAndRole(body.phone, body.role)

  if (!pro) throw new ForbiddenError(error)
  const hashedPassword = hashPassword(body.password)

  if (pro.password !== hashedPassword) {
    throw new ForbiddenError(error)
  }

  const token = generateJwt(
    { email: pro.email, role: pro.role, userId: pro.userId },
    false,
    // {
    //   expiresIn: String(dayjs.duration({ days: 30 }).as('ms')),
    // },
  )

  return { pro: PostLoginResponseSchema.parse(pro), token }
}

export const login =
  ({ repo }: { repo: Repo }) =>
  (
    body: PostLoginProRequest | PostLoginUserRequest | PostLoginAdminRequest,
  ) => {
    const isAdmin = body.role === ROLES.ADMIN
    const isPro = body.role === ROLES.PRO

    if (isAdmin) {
      return loginAdmin({
        repo,
        body: body as PostLoginAdminRequest,
      })
    } else if (isPro)
      return loginPro({
        repo,
        body: body as PostLoginProRequest,
      })
    else
      return loginUser({
        repo,
        body: body as PostLoginUserRequest,
      })
  }
