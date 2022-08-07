import { ROLES } from '../../config/constants'
import { signUpEmailTemplate } from '../../config/email/templates/signup'
import { emailQueue } from '../../config/queue'
import {
  PostSignupProRequest,
  PostSignupProRequestSchema,
  PostSignupRequestSchema,
  PostSignupUserRequest,
  PostSignupUserRequestSchema,
} from '../../schemas/request/postSignup'
import { hashPassword } from '../../utils'
import { ZodError } from 'zod'
import {
  PostLoginProRequest,
  PostLoginRequest,
  PostLoginRequestSchema,
  PostLoginUserRequest,
} from '../../schemas/request/postLogin'
import type { Repo, Role } from '../../types'
import {
  ForbiddenError,
  InternalError,
  ValidationError,
} from '../../utils/Error'
import { generateJwt } from '../../utils/jwtLib'

const login = async ({
  repo,
  body,
  role,
}: {
  repo: Repo
  body: PostLoginProRequest | PostLoginUserRequest | PostLoginRequest
  role: Role
}) => {
  if (!role) throw new ValidationError('Param role not passed')

  const req = PostLoginRequestSchema.parse({ ...body, role })

  const isAdmin = role === ROLES.ADMIN

  let user
  try {
    user = await repo.user.getUserByEmail(body.email)
  } catch (error) {
    throw new InternalError(error as string)
  }

  if (!user) throw new ForbiddenError('email or password incorrect')
  const hashedPassword = hashPassword(body.password)

  if (body.password !== hashedPassword) {
    throw new ForbiddenError('email or password incorrect')
  }
  if (!isAdmin && (user.deactivated || user.terminated)) {
    throw new ForbiddenError('account inactive, contact support')
  }

  if (role === ROLES.PRO && !user.verified) {
    throw new ForbiddenError('user not verified')
  }

  if (!isAdmin) {
    //TODO: verify faceId
    const device = user.devices.find(
      (device) =>
        device.value ===
        (body as PostLoginProRequest | PostLoginUserRequest).deviceInfo,
    )
    if (!device) throw new ForbiddenError('device not recognised')
  }

  const token = generateJwt({ email: req.email, role }, isAdmin, {
    expiresIn: isAdmin ? String(60 * 60 * 24) : String(60 * 60 * 24 * 7),
  })

  return {
    user,
    token,
  }
}

const signup = async ({
  repo,
  body,
  role,
}: {
  repo: Repo
  body: PostSignupProRequest | PostSignupUserRequest
  role: Role
}) => {
  //TODO: verify faceId
  if (!role) throw new ValidationError('Param role not passed')

  if (role === ROLES.USER) {
    PostSignupUserRequestSchema.parse({ ...body, role })
  } else if (role === ROLES.PRO) {
    PostSignupProRequestSchema.parse({ ...body, role })
  } else {
    PostSignupRequestSchema.parse({ ...body, role })
  }

  const _user = await repo.user.getUserByEmailandRole(body.email, role)
  if (_user) throw new ValidationError('User with this email already exists')

  const hashedPassword = hashPassword(body.password)

  const { deviceInfo, ...newBody } = body //eslint-disable-line

  const user = await repo.user.createUser({
    ...newBody,
    role: role,
    password: hashedPassword,
    devices: {
      create: {
        value: body.deviceInfo,
      },
    },
  })
  const token = generateJwt({ email: user.email, role }, false, {
    expiresIn: String(60 * 60 * 24 * 7),
  })

  emailQueue.add(signUpEmailTemplate(user.name))
  // paymentThreshold.add(
  //   { email: req.body.email },
  //   {
  //     attempts: 3,
  //     backoff: {
  //       type: 'exponential',
  //       delay: 5000,
  //     },
  //     delay: 60 * 60 * 24 * 2 * 1000,
  //     // repeat: {
  //     //   cron: '',
  //     //   startDate: new Date(),
  //     // },
  //     // timeout
  //   },
  // )

  return { user, token }
}

const makeAuth = ({ repo }: { repo: Repo }) => {
  return {
    login: (body: PostLoginRequest, role: Role) => login({ repo, body, role }),
    signup: (body: PostSignupProRequest | PostSignupUserRequest, role: Role) =>
      signup({ repo, body, role }),
  }
}

export default makeAuth
