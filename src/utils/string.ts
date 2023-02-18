import Filter from 'bad-words'

const filter = new Filter()

export const filterBadWords = <T>(str: T) => {
  if (!str || typeof str !== 'string') return str
  return filter.clean(str)
}
