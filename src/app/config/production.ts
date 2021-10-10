import { Setting } from '../types/index'

const production: Setting = {
  port: 3000,
  host: 'localhost',
  mongodb: {
    host: 'localhost',
    port: 27017,
    name: 'fire'
  }
}
export default production
