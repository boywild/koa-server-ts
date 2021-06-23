import * as Koa from 'koa'
import * as mongoose from 'mongoose'
import config from '../config'


export const database = (app: Koa): void => {
  const uri = `mongodb://${config.mongodb.host}:${config.mongodb.port}/${config.mongodb.name}`
  mongoose.set('debug', true)
  mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  mongoose.connection.on('open', async () => {
    await console.log('Connected to MongoDB')
  })
  mongoose.connection.on('error', async (error) => {
    await console.error(error)
  })
  mongoose.connection.on('disconnected', async () => {
    try {
      await mongoose.connect(uri)
    } catch (e) {
      console.error(e)
      process.exit(-1)
    }
  })
}
