// import * as Koa from 'koa'
import * as mongoose from 'mongoose'
import config from '../config'
import logger from '../utils/log4js'

export const database = (): void => {
  const uri = `mongodb://${config.mongodb.host}:${config.mongodb.port}/${config.mongodb.name}`
  mongoose.set('debug', true)
  void mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  mongoose.connection.on('open',  () => {
    logger.info('Connected to MongoDB')
  })
  mongoose.connection.on('error',  (error) => {
    logger.error(error)
  })
  mongoose.connection.on('disconnected',  () => {
    try {
      void mongoose.connect(uri)
    } catch (e) {
      logger.error(e)
      process.exit(-1)
    }
  })
}
