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

export interface Setting {
  port?: number,
  host?: string,
  mongodb?: DataBaseMongodb
}

export interface DataBaseMongodb {
  host: string,
  port: number,
  name: string
}

export interface AnyConfig {
  [key: string]: string
}

export type AllSetting = Setting | AnyConfig

export interface CoreConfigFactory {
  store: AllSetting,
  _prefix: string,
  _suffix: string,
  baseDir: string,
  setBaseDir: (baseDir: string) => void,
  getItem: (key: string) => string | number | unknown | Record<string, unknown>,
  getAll: () => Record<string, string | number>,
  setItem: (key: string, value: unknown) => void,
  hasItem: (key: string) => boolean,
  getConfigFromFile: (filePath: string | Array<string>) => void,
  getConfigFromObj: (obj: Record<string, unknown>) => void,
  getConfigFromEnv: () => void,
  getEnv: () => string,
  isDebug: () => boolean,
  prefix: (value: string) => void,
  suffix: (value: string) => void,
}