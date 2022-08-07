const getUser = ({ db }: { db: any }) => {
  db
  return {
    email: 'jideadedejifirst@gmail.com',
  }
}

const makeUserRepo = ({ db }: { db: any }) => {
  return { getUser: (email: string) => getUser({ db }) }
}

export default makeUserRepo
