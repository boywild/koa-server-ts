export type Method = 'GET' | 'POST' | 'PUT' | 'DEL' | 'HEAD' | 'PATCH' | 'OPTIONS'
export type Method2 = 'get' | 'post' | 'put' | 'del' | 'head' | 'patch' | 'options'

export interface RouteMap {
  controller: string
  route: string
  path: string
  method: Method | Method2
  methodName: string
  fn: () => unknown
}

export interface Exception {
  code: number
  message: string
}
