import type { Repo } from '../../types'
import { login } from './login'
import { signUp } from './signup'
import { validateOtp } from './validateOtp'
import { resetPassword } from './resetPassword'
import { confirmResetPassword } from './confirmResetPassword'
import { uploadFaceId } from './uploadFaceId'
import { generateOtp } from './generateOtp'

const makeAuth = ({ repo }: { repo: Repo }) => {
  return {
    login: login({ repo }),
    signUp: signUp({ repo }),
    validateOtp: validateOtp({ repo }),
    uploadFaceId: uploadFaceId({ repo }),
    confirmResetPassword: confirmResetPassword({ repo }),
    resetPassword: resetPassword({ repo }),
    generateOtp: generateOtp({ repo }),
  }
}

export default makeAuth
