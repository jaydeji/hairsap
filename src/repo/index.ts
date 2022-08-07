import makeUserRepo from './user'

const makeRepo = ({ db }: { db: any }) => {
  return {
    user: makeUserRepo({ db }),
  }
}

export default makeRepo
