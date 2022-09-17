import pino from 'pino'

const logger = pino({
  transport: {
    targets: [
      // {
      //   target: './transport.ts',
      //   level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      //   options: {},
      // },
      ...(process.env.NODE_ENV === 'development'
        ? [
            {
              target: 'pino-pretty',
              level: 'debug',
              options: {
                colorize: true,
              },
            },
          ]
        : []),
    ],
  },
})

export default {
  info: logger.info.bind(logger),
  err: logger.error.bind(logger),
  warn: logger.warn.bind(logger),
  debug: logger.debug.bind(logger),
}
