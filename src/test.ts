// import 'reflect-metadata'
// import * as Koa from 'koa'
// import * as Router from 'koa-router'
// import { Controller, Get, Post } from './app/decorator/httpMethod'
// import { mapRoute } from './app/middleware/router'
// import { glob } from 'glob'
// import { resolve } from 'path'
// import { configure, getLogger } from 'log4js'
// import * as path from 'path'
// import logger from '@/app/utils/log4js'
import * as path from 'path'
// import { resolve } from 'path'
// import { glob } from 'glob'

import { resolve } from 'path'
import Config from './app/core/configFactory'

//TODO 自动加载config目录下相关文件
function initConfig(): Config {
  const config = new Config()
  config.init()
  config.getConfigFromEnv()
  const env = config.getEnv()
  const envFile = resolve(__dirname, `./app/config/development.ts`)
  const message = resolve(__dirname, './app/config/message.ts')
  console.log(envFile)
  console.log(message)
  config.getConfigFromFile(envFile)
  config.getConfigFromFile(message)
  console.log(config)
  return config
}
initConfig()
// @Controller('/test')
// class SomeClass {
//   public user: string = 'chentian'
//
//   @Get('/a')
//   someGetMethod() {
//     return 'hello world'
//   }
//
//   @Post('/b')
//   somePostMethod() {
//   }
// }

// Reflect.getMetadata(PATH_METADATA, SomeClass) // '/test'

// console.log(mapRoute(SomeClass))
// const path = resolve(__dirname, 'app/router/**/*.ts')
// glob(path, (err, files) => {
//   if (err) return
//   files.forEach(ele => {
//     const module = require(ele)
//     console.log(mapRoute(module))
//   })
//
// })

// configure({
//   appenders: {
//     'out': { type: 'console' },
//     'access': {
//       type: 'dateFile',
//       filename: path.join('logs/', 'access'),
//       maxLogSize: 2048,
//       alwaysIncludePattern: true,
//       pattern: '-yyyy-MM-dd.log',
//       encoding: 'utf-8'
//     },
//     'application': {
//       type: 'dateFile',
//       filename: path.join('logs/', 'access'),
//       maxLogSize: 2048,
//       alwaysIncludePattern: true,
//       pattern: '-yyyy-MM-dd.log',
//       encoding: 'utf-8'
//     }
//   },
//   categories: {
//     default: { appenders: ['out'], level: 'warn' },
//     access: { appenders: ['out', 'access'], level: 'info' },
//     application: { appenders: ['out', 'application'], level: 'warn' }
//   }
// })
// const logger = getLogger()
// console.log(logger.isLevelEnabled('error'))

// const app = new Koa()
// const router = new Router()
//
// app.use(async (ctx, next) => {
//   console.log(ctx)
//   await next()
//   console.log(ctx)
// })
// app.use(router.routes())
// app.use(router.allowedMethods())
// router.get('/', (ctx) => {
//   ctx.body = '<h1>343434</h1>'
// })
// app.listen(2001, 'localhost', () => {
//   console.log(`server listen at localhost:2000`)
// })



// const env = config.getEnv()
// const configPath = resolve(__dirname, './app/config/**/*.ts')
// glob(configPath, (err, files) => {
//   console.log(files)
// })
