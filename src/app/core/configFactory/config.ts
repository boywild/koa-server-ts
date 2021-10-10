import { get, has, merge, set } from 'lodash'

export default class Config {
  private store = {}

  private _prefix: string
  private envSuffix: string
  private envKey: string
  private baseDir: string

  constructor() {
    this._prefix = 'NODE'
    this.envSuffix = 'NODE'
    this.envKey = 'NODE'
    this.baseDir = process.cwd()
  }

  public setBaseDir(baseDir: string = process.cwd()): void {
    this.baseDir = baseDir
  }

  public getItem(key = ''): string | number | unknown | Record<string, unknown> {
    if (key) {
      return get(this.store, key, '')
    } else {
      return this.store
    }
  }

  public getAll(): Record<string, string | number> {
    return this.store
  }

  public setItem(key: string, value: unknown): void {
    set(this.store, key, value)
  }

  public hasItem(key: string): boolean {
    return has(this.store, key)
  }

  public getConfigFromFile(filePath: string | Array<string>): void {
    const setStore = (path: string) => {
      const conf = <Record<string, unknown>>require(path).default || {}
      console.log(conf)
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
      [this.envKey]: 'debug'
    }
    envKeys.forEach((key) => {
      if (key.startsWith(this.prefix + this.envSuffix)) {
        const parts = key.split('_')
        if (parts.length === 2) {
          set(envs, this.envKey, process.env[key])
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
    const env = this.getItem(this.envKey)
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
