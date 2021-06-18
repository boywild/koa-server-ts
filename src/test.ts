import 'reflect-metadata'
import { Controller, Get, Post } from './app/decorator/httpMethod'

const METHOD_METADATA = 'method'
const PATH_METADATA = 'path'
const isConstructor = (name: string): boolean => {
  return name === 'constructor'
}
const isFunction = (fn: Function): boolean => {
  return Object.prototype.toString.call(fn) === '[object Function]'
}

function mapRoute(instance: Object) {
  const prototype = Object.getPrototypeOf(instance)
  console.log(Object.getOwnPropertyNames(prototype))
  // 筛选出类的 methodName
  const methodsNames = Object.getOwnPropertyNames(prototype)
    .filter(item => !isConstructor(item) && isFunction(prototype[item]))

  console.log(methodsNames)
  return methodsNames.map(methodName => {
    const fn = prototype[methodName]

    // 取出定义的 metadata
    const route = Reflect.getMetadata(PATH_METADATA, instance, methodName)
    const method = Reflect.getMetadata(METHOD_METADATA, instance, methodName)
    return {
      route,
      method,
      fn,
      methodName
    }
  })
}

@Controller('/test')
class SomeClass {
  public user: string = 'chentian'

  @Get('/a')
  someGetMethod() {
    return 'hello world'
  }

  @Post('/b')
  somePostMethod() {
  }
}

// Reflect.getMetadata(PATH_METADATA, SomeClass) // '/test'

console.log(mapRoute(new SomeClass()))
