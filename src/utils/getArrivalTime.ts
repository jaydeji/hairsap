import { dayjs } from '.'

const oneSecond = 1000

export const getArrivalTime = (distaceInMetres: number) => {
  const ms = dayjs
    .duration({ milliseconds: distaceInMetres * oneSecond })
    .as('ms')
  return dayjs().add(ms, 'ms').toDate()
}
