import * as Koa from 'koa'
// import Router from "koa-router"
import 'reflect-metadata'
import { METHOD_METADATA, PATH_METADATA } from '../decorator/httpMethod'

function isConstructor(name: string): boolean {
  return name === 'constructor'
}

function isFunction(fn: Function): boolean {
  return Object.prototype.toString.call(fn) === '[object Function]'
}

function normalizePath(path: string): string {
  return path.startsWith('/') ? path : '/' + path
}

interface RouteMap {
  route: string
  method: string
  methodName: string
  fn: Function
}

function mapRoute(instance: { new(...args: any[]): {} }): Array<RouteMap> {
  const prototype = Object.getPrototypeOf(instance)
  const methodsNames = Object.getOwnPropertyNames(prototype).filter(item => !isConstructor(item) && isFunction(prototype[item]))
  return methodsNames.map(methodName => {
    const fn = prototype[methodName]
    const route = Reflect.getMetadata(PATH_METADATA, instance, methodName)
    const method = Reflect.getMetadata(METHOD_METADATA, instance, methodName)
    return {
      route,
      method,
      methodName,
      fn
    }
  })
}


export const router = (app: Koa) => {

}
