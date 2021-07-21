export default class Config {
  private store = {}

  private _prefix = 'lin'
  private envSuffix = '_ENV'
  private baseDir = process.cwd()

  constructor() {
  }

  public init() {
  }

  public getItem() {
  }

  public setItem() {
  }

  public hasItem() {
  }

  public getConfigFromFile() {
  }

  public getConfigFromObj() {
  }

  public getConfigFromEnv() {
  }

  public getEnv() {
  }

  public isDebug() {
  }

  public set prefix(value: string) {
    this._prefix = value
  }

  public get prefix(): string {
    return this._prefix
  }

}
