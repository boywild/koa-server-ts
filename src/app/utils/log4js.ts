import * as path from 'path'
import { configure, getLogger } from 'log4js'

// configure('./filename')
configure({
  appenders: {
    'out': { type: 'console' },
    'access': {
      type: 'dateFile',
      filename: path.join('logs/', 'access'),
      maxLogSize: 2048,
      alwaysIncludePattern: true,
      pattern: '-yyyy-MM-dd.log',
      encoding: 'utf-8'
    },
    'application': {
      type: 'dateFile',
      filename: path.join('logs/', 'access'),
      maxLogSize: 2048,
      alwaysIncludePattern: true,
      pattern: '-yyyy-MM-dd.log',
      encoding: 'utf-8'
    }
  },
  categories: {
    default: { appenders: ['out'], level: 'info' },
    access: { appenders: ['out', 'access'], level: 'info' },
    application: { appenders: ['out', 'application'], level: 'warn' }
  }
})

const logger = getLogger()
export default logger
