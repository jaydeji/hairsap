export const signUpEmailTemplate = (name: string) => {
  return {
    from: '"Hairsap" <notify@hairsap.com>',
    to: 'admin@hairsap.com',
    subject: 'New SignUp',
    text: `A new user with name ${name} has signed up`,
    html: `<p>A new user with name ${name} has signed up</p>`,
  }
}
