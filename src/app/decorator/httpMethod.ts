import 'reflect-metadata'

export const METHOD_METADATA = Symbol('method')
export const PATH_METADATA = Symbol('path')

const createMethodDecorator = (method: string) => {
  return function httpMethodDecorator(path: string, isVerify?: boolean): MethodDecorator {
    return function(target, propertyKey, descriptor) {
      Reflect.defineMetadata(PATH_METADATA, path, target, propertyKey)
      Reflect.defineMetadata(METHOD_METADATA, method, target, propertyKey)
    }
  }
}

export const Controller = (path: string): ClassDecorator => (target) => {
  Reflect.defineMetadata(PATH_METADATA, path, target)
}

export const Get = createMethodDecorator('GET')
export const Post = createMethodDecorator('POST')
export const Put = createMethodDecorator('PUT')
export const Del = createMethodDecorator('DEL')
export const Head = createMethodDecorator('HEAD')
export const Patch = createMethodDecorator('PATCH')
export const Options = createMethodDecorator('OPTIONS')
