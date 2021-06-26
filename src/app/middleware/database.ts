import * as Koa from 'koa'
import * as mongoose from 'mongoose'
import config from '../config'
import logger from '../utils/log4js'

export const database = (app: Koa): void => {
  const uri = `mongodb://${config.mongodb.host}:${config.mongodb.port}/${config.mongodb.name}`
  mongoose.set('debug', true)
  mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  mongoose.connection.on('open', async () => {
    await logger.info('Connected to MongoDB')
  })
  mongoose.connection.on('error', async (error) => {
    await logger.error(error)
  })
  mongoose.connection.on('disconnected', async () => {
    try {
      await mongoose.connect(uri)
    } catch (e) {
      logger.error(e)
      process.exit(-1)
    }
  })
}
