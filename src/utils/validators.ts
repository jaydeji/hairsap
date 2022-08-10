export const isNumericString = (value: unknown) =>
  !!(value as string).match(/^\d+$/)

export const makeStringNumeric = (value: unknown) =>
  isNumericString(value) ? +(value as number) : value
