import { resolve } from 'path'
import * as Koa from 'koa'
import * as R from 'ramda'
import { glob } from 'glob'
import config, { ServerConfig } from './app/config'
import logger from './app/utils/log4js'

class Server {
  private app: Koa
  private readonly config: ServerConfig

  constructor() {
    this.app = new Koa()
    this.config = config
    this.useMiddleware(this.app)
  }

  async start() {
    const { port, host } = this.config
    await this.app.listen(port, host, () => {
      logger.info(`server listen at ${host}:${port}`)
    })
  }

  useMiddleware(app: Koa): void {
    const middlewarePath = resolve(__dirname, './app/middleware/**/*.ts')
    glob(middlewarePath, (err, files) => {
      if (files.length) {
        R.map(R.compose(
          R.map((module: Function) => {
            logger.info(`setting middleware ${module.name}`)
            return module(app)
          }),
          (file: string) => require(file)
        ))(files)
      }
    })
  }
}

const app = new Server()
app.start()
