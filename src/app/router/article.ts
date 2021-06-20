import { Controller, Get, Post } from '../decorator/httpMethod'

@Controller('/article')
class Article {

  @Get('/list')
  articles() {
  }

  @Get('detail')
  article() {
  }

  @Post('/save')
  addArticle() {
  }
}
export = Article