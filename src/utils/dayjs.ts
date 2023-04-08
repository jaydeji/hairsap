import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import relativeTime from 'dayjs/plugin/relativeTime'
import advancedFormat from 'dayjs/plugin/advancedFormat'
import en from 'dayjs/locale/en'

dayjs.extend(duration)
dayjs.extend(relativeTime)
dayjs.extend(advancedFormat)
dayjs.locale({
  ...en,
  weekStart: 1,
})

export default dayjs
