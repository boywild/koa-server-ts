import { Context } from 'koa'
import { Controller, Get, Post } from '../decorator/httpMethod'

@Controller('/article')
export default class Article {

  @Get('/list')
  articles(ctx: Context): void {
    ctx.body = '<h1>Get article list</h1>'
  }

  @Get('detail')
  article(ctx: Context): void {
    ctx.body = '<h1>Get article detail</h1>'
  }

  @Post('/save')
  addArticle(ctx: Context): void {
    ctx.body = '<h1>Post article save</h1>'
  }
}
