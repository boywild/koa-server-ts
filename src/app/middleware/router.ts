import { resolve } from 'path'
import 'reflect-metadata'
import * as Koa from 'koa'
import * as Router from 'koa-router'
import { METHOD_METADATA, PATH_METADATA } from '../decorator/httpMethod'
import { RouteMap } from '../type/type'
import { glob } from 'glob'

const router = new Router()

/**
 * 判断是否属于构造器类型
 * @param {string} name prototype上的方法名
 * @return {boolean} 是构造器返回true否则返回false
 */
function isConstructor(name: string): boolean {
  return name === 'constructor'
}

/**
 * 判断是否函数类型
 * @param {function} fn prototype上的方法
 * @return {boolean} 是函数类型返回true否则返回false
 */
function isFunction(fn: Function): boolean {
  return Object.prototype.toString.call(fn) === '[object Function]'
}

/**
 * 路由类映射为数组
 * @param {object class} instance 路由class类
 * @return RouteMap 返回映射数组
 */
function mapRoute<T extends { new(...arg: any[]): any }>(instance: T): Array<RouteMap> {
  const controller = Reflect.getMetadata(PATH_METADATA, instance)
  const newInstance = new instance()
  const prototype = Object.getPrototypeOf(newInstance)
  const methodsNames = Object.getOwnPropertyNames(prototype).filter(item => !isConstructor(item) && isFunction(prototype[item]))
  return methodsNames.map(methodName => {
    const fn = prototype[methodName]
    const route = Reflect.getMetadata(PATH_METADATA, newInstance, methodName)
    const method = Reflect.getMetadata(METHOD_METADATA, newInstance, methodName)
    return {
      controller,
      route,
      path: controller + route,
      method: method.toLowerCase(),
      methodName,
      fn
    }
  })
}

/**
 * 挂载路由到koa-router
 * @param {object} app koa实例
 */
export const addRouter = (app: Koa): void => {
  const path = resolve(__dirname, '../router/**/*.ts')
  //自动加载路由文件夹-支持文件夹嵌套
  glob(path, (err, files) => {
    if (err) return
    files.forEach(ele => {
      //动态加载路由类并实例化
      const module = require(ele).default
      const instance = new module()
      const routes = mapRoute(module)
      routes.forEach((route: RouteMap) => {
        const { method, path, methodName } = route
        //挂载路由
        router[method](path, instance[methodName])
      })
    })

  })
  app.use(router.routes())
  app.use(router.allowedMethods())
}
