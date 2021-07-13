import { Context } from 'koa'
import { Controller, Post } from '../../decorator/httpMethod'

@Controller('/logout')
export default class Logout {

  @Post('/user')
  userLogout(ctx: Context): void {
    ctx.body = '<h1>Post logout user</h1>'
  }
}
