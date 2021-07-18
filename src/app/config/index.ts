const env = process.env.NODE_ENV || 'development'

const envConfig = <EnvConfig>require(`./${env}`).default

export interface EnvConfig {
  port: number,
  host: string,
  mongodb: DataBaseConfig
}

export interface DataBaseConfig {
  host: string,
  port: number,
  name: string
}

export interface ServerConfig extends EnvConfig {
  env: string
}

const serverConfig = <ServerConfig>{
  env
}

const config = <ServerConfig>Object.assign(serverConfig, envConfig)
export default config
