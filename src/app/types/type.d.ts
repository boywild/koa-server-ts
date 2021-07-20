type Method = 'GET' | 'POST' | 'PUT' | 'DEL' | 'HEAD' | 'PATCH' | 'OPTIONS'
type Method2 = 'get' | 'post' | 'put' | 'del' | 'head' | 'patch' | 'options'

interface RouteMap {
  controller: string
  route: string
  path: string
  method: Method | Method2
  methodName: string
  fn: () => unknown
}

export {
  RouteMap,
  Method,
  Method2
}
