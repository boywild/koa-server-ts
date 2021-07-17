import { Context } from 'koa'
import { Controller, Post } from '../../decorator/httpMethod'

@Controller('/login')
export default class Login {

  @Post('/user')
  userLogin(ctx: Context): void {
    ctx.body = '<h1>Post login user</h1>'
  }
}
