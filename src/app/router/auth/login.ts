import { Context } from 'koa'
import { Controller, Post } from '../../decorator/httpMethod'

@Controller('/login')
class Login {

  @Post('/user')
  userLogin(ctx: Context) {
    ctx.body = '<h1>Post login user</h1>'
  }
}

export = Login
