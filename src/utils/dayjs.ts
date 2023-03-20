import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import relativeTime from 'dayjs/plugin/relativeTime'
import en from 'dayjs/locale/en'

dayjs.extend(duration)
dayjs.extend(relativeTime)
dayjs.locale({
  ...en,
  weekStart: 1,
})

export default dayjs
