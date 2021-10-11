import { get, has, merge, set } from 'lodash'
import { AllSetting, CoreConfigFactory } from '../../types'

export default class Config implements CoreConfigFactory {
  /**
   * 读取的配置信息都会合并到store中存储
   * @private
   */
  private store: AllSetting
  private _prefix: string
  private _suffix: string
  private baseDir: string

  constructor() {
    this._prefix = 'NODE'
    this._suffix = '_ENV'
    this.baseDir = process.cwd()
    //默认
    this.store = {
      port: 8080,
      host: 'localhost',
      mongodb: {
        host: 'localhost',
        port: 27017,
        name: 'fire'
      }
    }
  }

  public setBaseDir(baseDir: string = process.cwd()): void {
    this.baseDir = baseDir
  }

  /**
   * 读取单条配置信息
   * @param key 键
   */
  public getItem(key = ''): string | number | unknown | Record<string, unknown> {
    if (key) {
      return get(this.store, key, '')
    } else {
      return this.store
    }
  }

  public getAll(): AllSetting {
    return this.store
  }

  /**
   * 设置单条配置信息
   * @param key 键
   * @param value 值
   */
  public setItem(key: string, value: unknown): void {
    set(this.store, key, value)
  }

  /**
   * 判断配置信息是否存在
   * @param key
   */
  public hasItem(key: string): boolean {
    return has(this.store, key)
  }

  /**
   * 从配置文件中读取配置信息并到store中存储
   * @param {String|Array} filePath 配置文件绝对路径
   */
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

  /**
   * 从ts对象中读取键值队到store中存储
   * @param {Object} obj
   */
  public getConfigFromObj(obj: Record<string, unknown>): void {
    this.store = merge(this.store, obj)
  }

  /**
   * 从node的环境变量中读取固定字符串开头(NODE_ENV)的配置信息合并到store中存储
   */
  public getConfigFromEnv(): void {
    const envKeys = Object.keys(process.env)
    const envs = {
      [this.prefix + this.suffix]: 'debug'
    }
    envKeys.forEach((key) => {
      if (key.startsWith(this.prefix + this.suffix)) {
        set(envs, key, process.env[key])
      }
    })

    this.store = merge(this.store, envs)
  }

  /**
   * 获取当前系统环境(NODE_ENV)
   */
  public getEnv(): string {
    const env = this.getItem(this.prefix + this.suffix)
    if (typeof env === 'string') {
      return env.toLowerCase()
    } else {
      return ''
    }
  }

  /**
   * 判断当前系统是否属于debug环境
   */
  public isDebug(): boolean {
    return this.getEnv() === 'debug'
  }

  /**
   * 设置环境变量特定前缀
   * @param {String} value
   */
  public set prefix(value: string) {
    this._prefix = value
  }

  /**
   * 获取环境变量特定前缀
   */
  public get prefix(): string {
    return this._prefix
  }

  /**
   * 设置环境变量特定后缀
   * @param {String} value
   */
  public set suffix(value: string) {
    this._suffix = value
  }

  /**
   * 获取环境变量特定后缀
   */
  public get suffix(): string {
    return this._suffix
  }


}