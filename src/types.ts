import makeRepo from './repo'
import makeServices from './services'

export type Repo = ReturnType<typeof makeRepo>
export type Service = ReturnType<typeof makeServices>

interface HsapBody {
  message: string
  validationError?: any
  data?: any
}

export interface HsapResponse {
  statusCode: number
  body: Omit<HsapBody, 'validationError'> | Omit<HsapBody, 'data'>
}

export type HsapError = Error
