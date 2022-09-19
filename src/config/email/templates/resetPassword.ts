export const resetPasswordTemplate = ({
  email,
  token,
  from,
}: {
  email: string
  token: string
  from: string
}) => {
  return {
    from: `"Hairsap" <${from}>`,
    to: email,
    subject: 'New SignUp',
    text: `A password reset has been initiated. Please use this token ${token} which expires in 1 hour`,
    html: `A password reset has been initiated. Please use this token ${token} which expires in 1 hour`,
  }
}
