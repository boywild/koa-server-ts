import { Context } from 'koa'
import { Controller, Post } from '../../decorator/httpMethod'

@Controller('/register')
export default class Register {

  @Post('/user')
  userRegister(ctx: Context): void {
    ctx.body = '<h1>Post register user</h1>'
  }
}
