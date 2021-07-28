import { resolve } from 'path'
import { get, has, merge, set } from 'lodash'

export default class Config {
  private store = {}

  private _prefix = 'lin'
  private envSuffix = '_ENV'
  private baseDir = process.cwd()

  public init(baseDir: string = process.cwd()) {
    this.baseDir = baseDir
  }

  public getItem(key: string): string | number {
    return get(this.store, key, '')
  }

  public setItem(key: string, value: unknown): void {
    set(this.store, key, value)
  }

  public hasItem(key: string): boolean {
    return has(this.store, key)
  }

  public getConfigFromFile(filePath: string | Array<string>): void {
    const setStore = (path: string) => {
      const conf = require(resolve(this.baseDir, path)).default || {}
      this.store = merge(this.store, conf)
    }
    if (typeof filePath === 'string') {
      setStore(filePath)
    } else {
      filePath.forEach(path => {
        setStore(path)
      })
    }
  }

  public getConfigFromObj(obj: Record<string, unknown>): void {
    this.store = merge(this.store, obj)
  }

  public getConfigFromEnv(): void {
    const envKeys = Object.keys(process.env)
    const envs = {
      [this.prefix + this.envSuffix]: 'debug'
    }
    envKeys.forEach((key) => {
      if (key.startsWith(this.prefix + this.envSuffix)) {
        const parts = key.split('_')
        if (parts.length === 2) {
          set(envs, parts[1], process.env[key])
        } else if (parts.length > 2) {
          let k = key.replace(`${this.prefix}_`, '')
          k = k.replace('_', '.')
          set(envs, k, process.env[key])
        }
      }
    })

    this.store = merge(this.store, envs)
  }

  public getEnv(): string {
    const env = this.getItem(this._prefix + this.envSuffix)
    if (typeof env === 'string') {
      return env.toLowerCase()
    } else {
      return ''
    }
  }

  public isDebug(): boolean {
    return this.getEnv() === 'debug'
  }

  public set prefix(value: string) {
    this._prefix = value
  }

  public get prefix(): string {
    return this._prefix
  }

}
