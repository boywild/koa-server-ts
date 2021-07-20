import 'reflect-metadata'
import { Method } from '../types/type'

export const METHOD_METADATA = Symbol('method')
export const PATH_METADATA = Symbol('path')

/**
 * 路径序列化
 * @param {string} path 需要检测的路径
 * @return {string} 返回序列化后的字符串路径
 */
function normalizePath(path: string): string {
  if (!path) return ''
  return path.startsWith('/') ? path : '/' + path
}

/**
 * 创建路由装饰器Get/Post等
 * @param {string} method http请求方法GET/POST等
 * @return MethodDecorator 返回方法装饰器
 */
const createMethodDecorator = (method: Method) => {
  return function httpMethodDecorator(path: string): MethodDecorator {
    path = normalizePath(path)
    return function(target, propertyKey) {
      Reflect.defineMetadata(PATH_METADATA, path, target, propertyKey)
      Reflect.defineMetadata(METHOD_METADATA, method, target, propertyKey)
    }
  }
}

/**
 * 创建类控制器
 * @param {string} path 类控制器路径
 * @constructor 返回类装饰器
 */
export const Controller = (path: string): ClassDecorator => (target) => {
  path = normalizePath(path)
  Reflect.defineMetadata(PATH_METADATA, path, target)
}

export const Get = createMethodDecorator('GET')
export const Post = createMethodDecorator('POST')
export const Put = createMethodDecorator('PUT')
export const Del = createMethodDecorator('DEL')
export const Head = createMethodDecorator('HEAD')
export const Patch = createMethodDecorator('PATCH')
export const Options = createMethodDecorator('OPTIONS')
