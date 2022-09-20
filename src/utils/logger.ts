import pino from 'pino'

const logger = pino({
  transport:
    process.env.NODE_ENV === 'development'
      ? {
          targets: [
            {
              target: 'pino-pretty',
              level: 'debug',
              options: {
                colorize: true,
              },
            },
          ],
        }
      : undefined,
})

export default {
  info: logger.info.bind(logger),
  err: logger.error.bind(logger),
  warn: logger.warn.bind(logger),
  debug: logger.debug.bind(logger),
}
