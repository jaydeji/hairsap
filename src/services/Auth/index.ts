import { ZodError } from 'zod'
import { PostLoginRequestSchema } from '../../schemas/request/postLogin'
import type { Repo } from '../../types'
import {
  InternalError,
  NotFoundError,
  ValidationError,
} from '../../utils/Error'
import { generateJwt } from '../../utils/generateJwt'

const login = ({ repo, body }: { repo: Repo; body: unknown }) => {
  let req
  try {
    req = PostLoginRequestSchema.parse(body)
  } catch (error) {
    throw new ValidationError((error as ZodError).issues)
  }
  try {
    const user = repo.user.getUser(req.email)
    if (!user) throw new NotFoundError('user not found')
  } catch (error) {
    throw new InternalError()
  }
  return { token: generateJwt({ email: req.email }) }
}

const makeAuth = ({ repo }: { repo: Repo }) => {
  return {
    login: (body: unknown) => login({ repo, body }),
  }
}

export default makeAuth
