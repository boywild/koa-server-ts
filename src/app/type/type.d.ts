type Method = 'get' | 'post' | 'put' | 'del' | 'head' | 'patch' | 'options'

interface RouteMap {
  controller: string
  route: string
  path: string
  method: Method
  methodName: string
  fn: Function
}

export {
  RouteMap
}
