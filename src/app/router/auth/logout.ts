import { Context } from 'koa'
import { Controller, Get, Post } from '../../decorator/httpMethod'

@Controller('/logout')
export default class Logout {

  @Post('/user')
  userLogout(ctx: Context) {
    ctx.body = '<h1>Post logout user</h1>'
  }
}
