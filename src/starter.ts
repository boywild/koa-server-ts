import * as Koa from 'koa'
import * as Router from 'koa-router'
import {ExtendableContext} from "koa";

const app = new Koa();
// const router = new Router();
//
// router.get('/*', async (ctx: ExtendableContext) => {
//     ctx.body = "hello world"
// })
//
// app.use(router.routes())
app.listen(3000, 'localhost', () => {
    console.log('server listen at localhost:3000')
})
