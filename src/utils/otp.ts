import crypto from 'crypto'

const generateLoginOtp = (size = 6): Promise<string> =>
  new Promise((res) =>
    crypto.randomBytes(3, (err, buffer) => {
      const otp = parseInt(buffer.toString('hex'), 16)
        .toString()
        .substring(0, size)
      res(String(otp))
    }),
  )

export { generateLoginOtp }
