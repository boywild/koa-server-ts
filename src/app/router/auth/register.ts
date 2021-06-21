import { Context } from 'koa'
import { Controller, Get, Post } from '../../decorator/httpMethod'

@Controller('/register')
export default class Register {

  @Post('/user')
  userRegister(ctx: Context) {
    ctx.body = '<h1>Post register user</h1>'
  }
}
