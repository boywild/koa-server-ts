import { Exception } from '../../types'

class HttpException extends Error {
  public status = 500
  public code = 9999
  public message = ''

  constructor(ex: Exception | number) {
    super()
    this.exceptionHandler(ex)
  }

  protected exceptionHandler(ex: Exception | number) {
    if (typeof ex === 'number') {
      this.status = 400
      this.code = ex
    }
  }

}
