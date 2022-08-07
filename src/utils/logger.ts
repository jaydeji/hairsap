import { debug } from 'debug'
const i = debug('info')
const e = debug('error')
const w = debug('warn')

export enum Formatter {
  MULTI_LINE_OBJ = '%0',
  SINGLE_LINE_OBJ = '%o',
  JSON = '%j',
  NONE = '%%',
}

const info = (obj: unknown, message?: string, formatter?: Formatter): void => {
  if (message)
    if (formatter) i(formatter, obj, message)
    else i('%j', obj, message)
  else if (formatter) i(formatter, obj)
  else i('%j', obj)
}

const err = (obj: unknown, message?: string, formatter?: Formatter): void => {
  if (message)
    if (formatter) e(formatter, obj, message)
    else e('%o', obj, message)
  else if (formatter) e(formatter, obj)
  else e('%o', obj)
}

const warn = (obj: unknown, message?: string, formatter?: Formatter): void => {
  if (message)
    if (formatter) w(formatter, obj, message)
    else w('%j', obj, message)
  else if (formatter) w(formatter, obj)
  else w('%j', obj)
}

export default { info, err, warn }
