import type { Repo } from '../../types'
import { login } from './login'
import { signUp } from './signup'
import { validateOtp } from './validateOtp'
import { resetPassword } from './resetPassword'
import { confirmResetPassword } from './confirmResetPassword'
import { uploadFaceId } from './uploadFaceId'
import { generateOtp } from './generateOtp'
import { Queue } from '../Queue'
import { changePassword } from './changePassword'

const makeAuth = ({ repo, queue }: { repo: Repo; queue: Queue }) => {
  return {
    login: login({ repo }),
    signUp: signUp({ repo, queue }),
    validateOtp: validateOtp({ repo }),
    uploadFaceId: uploadFaceId({ repo }),
    confirmResetPassword: confirmResetPassword({ repo }),
    resetPassword: resetPassword({ repo, queue }),
    generateOtp: generateOtp({ repo, queue }),
    changePassword: changePassword({ repo }),
  }
}

export default makeAuth
