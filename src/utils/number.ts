export const addCommas = (value: number) => {
  return new Intl.NumberFormat().format(value)
}
