import * as Router from 'koa-router'
const router = new Router();

router.get("/v1/book/laster33", (ctx, next) => {
  ctx.body = {key: ctx.path};
})

export　= router