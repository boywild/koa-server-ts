import { EnvConfig } from '../types/index'

const development: EnvConfig = {
  port: 2000,
  host: 'localhost',
  mongodb: {
    host: 'localhost',
    port: 27017,
    name: 'fire'
  }
}
export default development
