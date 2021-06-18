import * as Koa from 'koa'
import * as bodyParser from 'koa-bodyparser'

export const addBody = (app: Koa): void => {
  app.use(bodyParser())
}
