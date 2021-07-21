import { resolve } from 'path'
import 'reflect-metadata'
import * as Koa from 'koa'
import * as Router from 'koa-router'
import { METHOD_METADATA, PATH_METADATA } from '../decorator/httpMethod'
import { RouteMap, Method, Method2 } from '../types'
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
function isFunction(fn: () => unknown): boolean {
  return Object.prototype.toString.call(fn) === '[object Function]'
}

/**
 * 路由类映射为数组
 * @param {object class} instance 路由class类
 * @return RouteMap 返回映射数组
 */

type RouteFunction = () => unknown

function mapRoute<T extends { new(...arg: any[]): any }>(instance: T): Array<RouteMap> {
  const controller = <string>Reflect.getMetadata(PATH_METADATA, instance)
  const newInstance = <ObjectConstructor>new instance()
  const prototype = <Record<string, RouteFunction>>Object.getPrototypeOf(newInstance)
  const methodsNames = Object.getOwnPropertyNames(prototype).filter(item => !isConstructor(item) && isFunction(prototype[item]))
  const routes = methodsNames.map((methodName: string): RouteMap => {
    const fn = prototype[methodName]
    const route = <string>Reflect.getMetadata(PATH_METADATA, newInstance, methodName)
    const method: Method = <Method>Reflect.getMetadata(METHOD_METADATA, newInstance, methodName)
    return {
      controller,
      route,
      path: controller + route,
      method,
      methodName,
      fn
    }
  })
  return routes
}

/**
 * 挂载路由到koa-router
 * @param {object} app koa实例
 */
interface Obj {
  [name: string]: ObjectConstructor
}

export const addRouter = (app: Koa): void => {
  const path = resolve(__dirname, '../router/**/*.ts')
  //自动加载路由文件夹-支持文件夹嵌套
  glob(path, (err, files) => {
    if (err) return
    files.forEach(ele => {
      //动态加载路由类并实例化
      const module = <ObjectConstructor>require(ele).default
      if (module) {
        const instance = <Obj>new module()
        const routes = mapRoute(module)
        routes.forEach((route: RouteMap) => {
          const { method, path, methodName } = route
          //挂载路由
          router[<Method2>method.toLowerCase()](path, instance[methodName])
        })
      }
    })

  })
  app.use(router.routes())
  app.use(router.allowedMethods())
}
