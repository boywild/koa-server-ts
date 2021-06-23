import 'reflect-metadata'
import { Controller, Get, Post } from './app/decorator/httpMethod'
// import { mapRoute } from './app/middleware/router'
import { glob } from 'glob'
import { resolve } from 'path'

@Controller('/test')
class SomeClass {
  public user: string = 'chentian'

  @Get('/a')
  someGetMethod() {
    return 'hello world'
  }

  @Post('/b')
  somePostMethod() {
  }
}

// Reflect.getMetadata(PATH_METADATA, SomeClass) // '/test'

// console.log(mapRoute(SomeClass))
// const path = resolve(__dirname, 'app/router/**/*.ts')
// glob(path, (err, files) => {
//   if (err) return
//   files.forEach(ele => {
//     const module = require(ele)
//     console.log(mapRoute(module))
//   })
//
// })
