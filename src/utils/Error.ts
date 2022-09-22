import { NextFunction, Request, Response } from 'express'
import { ZodError } from 'zod'
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
    this.name = this.constructor.name
  }
}

class InternalError extends HsapError {
  status = 500
  message: string

  constructor(message: string = ErrorType.INTERNAL_ERROR) {
    super(message, 500)
    this.message = message
    this.name = this.constructor.name
  }
}

class ForbiddenError extends HsapError {
  status = 403
  message: string

  constructor(message: string = ErrorType.FORBIDDEN) {
    super(message, 403)
    this.message = message
    this.name = this.constructor.name
  }
}

class NotFoundError extends HsapError {
  status = 404
  message: string

  constructor(message: string = ErrorType.NOT_FOUND) {
    super(message, 404)
    this.message = message
    this.name = this.constructor.name
  }
}

class UnauthorizedError extends HsapError {
  status = 401
  message: string

  constructor(message: string = ErrorType.UNAUTHORIZED) {
    super(message, 401)
    this.message = message
    this.name = this.constructor.name
  }
}

const handleError = (
  _err: HsapError,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  let err = _err

  if ((err as any)?.type === 'entity.parse.failed') {
    err = new HsapError('entity.parse.failed', 413)
  }

  if (err instanceof ZodError) {
    err = new ValidationError(err.issues)
  }

  if (err instanceof InternalError || !(err instanceof HsapError)) {
    //TODO: send to sentry|logdna|newrelic or email
    logger.err(
      {
        err,
        req: {
          path: req.path,
          params: req.params,
          baseUrl: req.baseUrl,
          body: req.body,
        },
      },
      'Internal Error',
    )
  }

  if (!(err instanceof HsapError)) {
    //Don't send error to user
    err = new InternalError()
  }

  res
    .status(err.status)
    .send({ message: err.message, validationError: err.validationError })
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
