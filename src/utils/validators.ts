export const isNumericString = (value: unknown) =>
  !!(value as string).match(/^\d+$/)

export const makeStringNumeric = (value: unknown) =>
  isNumericString(value) ? +(value as number) : value

export const isValidPhone = (phoneNumber?: string) => {
  if (!phoneNumber) return false
  const re =
    /^\+{0,2}([-. ])?(\(?\d{0,3}\))?([-. ])?\(?\d{0,3}\)?([-. ])?\d{3}([-. ])?\d{4}/
  return re.test(phoneNumber)
}
