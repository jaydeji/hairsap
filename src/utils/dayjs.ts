import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import en from 'dayjs/locale/en'
dayjs.extend(duration)
dayjs.locale({
  ...en,
  weekStart: 1,
})

export default dayjs
