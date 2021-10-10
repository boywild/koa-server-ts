import { Setting } from '../types/index'

const development: Setting = {
  port: 2000,
  host: 'localhost',
  mongodb: {
    host: 'localhost',
    port: 27017,
    name: 'fire'
  }
}
export default development
