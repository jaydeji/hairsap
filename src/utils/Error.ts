import { NextFunction, Request, Response } from 'express'
import logger from './logger'

const ErrorType = {
  VALIDATION_ERROR: 'Validation Error',
  INTERNAL_ERROR: 'Internal Error',
  FORBIDDEN: 'Forbidden',
  NOT_FOUND: 'Not Found',
  UNAUTHORIZED: 'Unauthorized',
} as const

class HsapError extends Error {
  status = 500
  message: string
  validationError?: any

  constructor(message: string, status: number, validationError?: any) {
    super(message)
    this.message = message
    this.status = status
    this.validationError = validationError
  }
}

class ValidationError extends HsapError {
  status = 400
  message: string
  validationError: any

  constructor(error: any) {
    super(
      typeof error === 'string' ? error : ErrorType.VALIDATION_ERROR,
      400,
      typeof error !== 'string' ? error : undefined,
    )
    this.message =
      typeof error === 'string' ? error : ErrorType.VALIDATION_ERROR
    this.validationError = typeof error !== 'string' ? error : undefined
  }
}

class InternalError extends HsapError {
  status = 500
  message: string

  constructor(message: string = ErrorType.INTERNAL_ERROR) {
    super(message, 500)
    this.message = message
  }
}

class ForbiddenError extends HsapError {
  status = 403
  message: string

  constructor(message: string = ErrorType.FORBIDDEN) {
    super(message, 403)
    this.message = message
  }
}

class NotFoundError extends HsapError {
  status = 404
  message: string

  constructor(message: string = ErrorType.NOT_FOUND) {
    super(message, 404)
    this.message = message
  }
}

class UnauthorizedError extends HsapError {
  status = 401
  message: string

  constructor(message: string = ErrorType.UNAUTHORIZED) {
    super(message, 401)
    this.message = message
  }
}

const handleError = (
  _err: HsapError,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  let err = _err
  if (err instanceof InternalError || !(err instanceof HsapError)) {
    //TODO: send to sentry or email
    logger.err(err.message)
  }

  if (!(err instanceof HsapError)) {
    err = new InternalError((err as Error).message)
  }

  res.status(err.status).send(err.message)
}

export {
  HsapError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  InternalError,
  ForbiddenError,
  handleError,
}
