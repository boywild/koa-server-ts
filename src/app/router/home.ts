import { Context } from 'koa'
import { Controller, Get, Post } from '../decorator/httpMethod'

@Controller('/home')
class Home {

  @Get('/banner')
  banner(ctx: Context) {
    ctx.body = '<h1>Get home banner</h1>'
  }

  @Get('/adv')
  adv(ctx: Context) {
    ctx.body = '<h1>Get home adv</h1>'
  }

  @Post('/addAdv')
  addAdv(ctx: Context) {
    ctx.body = '<h1>Post home addAdv</h1>'
  }
}

export = Home
