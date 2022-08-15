export const resetPasswordTemplate = ({
  email,
  token,
}: {
  email: string
  token: string
}) => {
  return {
    from: '"Hairsap" <notify@hairsap.com>',
    to: email,
    subject: 'New SignUp',
    text: `A password reset has been initiated. Please use this token ${token} which expires in 1 hour`,
    html: `A password reset has been initiated. Please use this token ${token} which expires in 1 hour`,
  }
}
