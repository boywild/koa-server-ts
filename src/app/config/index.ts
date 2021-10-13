import { resolve } from 'path'
import Config from '../core/configFactory'
// import { CoreConfigFactory } from '../types'

//TODO 自动加载config目录下相关文件
function initConfig() {
  const config = new Config()
  config.getConfigFromEnv()
  const env = config.getEnv()
  const envFile = resolve(__dirname, `./${env}.ts`)
  const message = resolve(__dirname, './message.ts')
  config.getConfigFromFile(envFile)
  config.getConfigFromFile(message)
  return config
}

export default initConfig()
