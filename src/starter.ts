import * as Koa from 'koa'
import * as Router from 'koa-router'
// import {Application} from 'koa'
import config, { ServerConfig } from './app/config'
import { addRouter } from './app/middleware/router'

class Server {
  private app: Koa
  private readonly config: ServerConfig
  private middlewears: Array<string> = ['database', 'router', 'server']

  constructor() {
    this.app = new Koa()
    this.config = config
  }

  start() {
    //middleware
    //router
    //database
    //server
    const { port, host } = this.config
    addRouter(this.app)
    this.app.listen(port, host, () => {
      console.log(`server listen at ${host}:${port}`)
    })
  }
}

const app = new Server()
app.start()
