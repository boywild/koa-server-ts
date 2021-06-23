import { resolve } from 'path'
import * as Koa from 'koa'
import * as Router from 'koa-router'
// import {Application} from 'koa'
import * as R from 'ramda'
import { glob } from 'glob'
import config, { ServerConfig } from './app/config'
import { addRouter } from './app/middleware/router'

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
      console.log(`server listen at ${host}:${port}`)
    })
  }

  useMiddleware(app: Koa): void {
    const middlewarePath = resolve(__dirname, './app/middleware/**/*.ts')
    glob(middlewarePath, (err, files) => {
      if (files.length) {
        R.map(R.compose(
          R.map((module: Function) => {
            console.log(`setting middleware ${module.name}`)
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
