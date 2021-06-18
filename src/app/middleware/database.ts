import * as Koa from 'koa'
import * as mongoose from 'mongoose'
import config from '../config'


export const database = (app: Koa): void => {
  console.log('setting database middleware')
  const uri = `mongodb://${config.mongodb.host}:${config.mongodb.port}/${config.mongodb.name}`
  mongoose.set('debug', true)
  mongoose.connect(uri)
  mongoose.connection.on('open', async () => {
    await console.log('Connected to MongoDB')
  })
  mongoose.connection.on('error', async (error) => {
    await console.error(error)
  })
  mongoose.connection.on('disconnected', async () => {
    await mongoose.connect(uri)
  })
}
