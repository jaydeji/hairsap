export const getEmailStagePrefix = (): string => {
  if (process.env.NODE_ENV === 'production') return ''
  return `[${process.env.NODE_ENV}]: `
}
