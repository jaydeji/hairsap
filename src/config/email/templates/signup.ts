import { getEmailStagePrefix } from '../../../utils'

export const signUpEmailTemplate = (name: string) => {
  return {
    from: '"Hairsap" <notify@hairsap.com>',
    to: 'admin@hairsap.com',
    subject: `${getEmailStagePrefix()}New SignUp`,
    text: `A new user with name ${name} has signed up`,
    html: `<p>A new user with name ${name} has signed up</p>`,
  }
}
export const otpEmailTemplate = ({
  email,
  name,
  otp,
  from,
}: {
  email: string
  name: string
  otp: string
  from: string
}) => {
  return {
    from: `"Hairsap" <${from}>`,
    to: email,
    subject: `${getEmailStagePrefix()}Your OTP Code`,
    text: `Dear ${name},\n Please use the OTP code: ${otp} to complete your login.`,
    html: `<p>Dear ${name},\n Please use the OTP code: ${otp} to complete your login.</p>`,
  }
}
