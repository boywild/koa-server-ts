import { Context } from 'koa'
import { Controller, Get, Post } from '../decorator/httpMethod'

@Controller('/home')
export default class Home {

  @Get('/banner')
  banner(ctx: Context) {
    // ctx.res.writeHead(200, '2323', { 'Content-Length': 'text/html' })
    // ctx.res.end('<h1>Get home banner</h1>')
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
