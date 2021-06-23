import { configure, getLogger } from 'log4js'

// configure('./filename')
configure({
  appenders: {
    'normal': { type: 'console' },
    'pro': {
      type: 'dateFile',
      filename: __dirname + '../../../logs/',
      pattern: '-yyyy-MM-dd-hh.log',
      encoding: 'utf-8'
    }
  },
  categories: { default: { appenders: ['pro'], level: 'info' } }
})

const logger = getLogger()
logger.level = 'debug'
logger.debug('Some debug messages')
export default logger
