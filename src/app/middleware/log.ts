import * as Koa from 'koa'
import { Context, ExtendableContext, Middleware,Response } from 'koa'
import { Logger, levels, Level } from 'log4js'
import { accessLogger } from '../utils/log4js'

const DEFAULT_FORMAT =
  '$remote-addr - -' +
  ' "$method $url HTTP/$http-version"' +
  ' $status $content-length "$referrer"' +
  ' $user-agent'

const DEFAULT_LEVEL_MAPPER = (code: number): Level => {
  let level: Level = levels.DEBUG
  if (code <= 300) {
    level = levels.INFO
  } else if (code <= 400) {
    level = levels.WARN
  } else if (code <= 500) {
    level = levels.ERROR
  }
  return level
}
type NoLog = string | RegExp | Array<string | RegExp>

// type OutgoingHttpHeader = number | string | string[];
type CallBack = (str: string) => string

interface LogObjectOptions {
  level: string
  format?: (ctx: ExtendableContext, callback: CallBack) => string | string
  nolog?: NoLog
  tokens?: Array<Token>
  levelMapper?: (code: number) => Level
}

interface LogStringOptions {
  format: string
}

type LogOptions = LogObjectOptions | LogStringOptions | Record<string, unknown>

interface Token {
  token: string | RegExp
  replacement: (match: string, field: string) => string | string
  component?: (match: string, field: string) => string
}

interface CtxResponse extends Response{
  _logging?:boolean,
  responseTime?:number
  _headers?:Record<string, unknown>
}

function getLogger(log4js: Logger, options: LogOptions): Middleware {
  if (typeof options === 'string') {
    options = { format: options }
  } else if (!options) {
    options = {}
  }
  const logger = log4js
  let level = levels.getLevel((<LogObjectOptions>options).level) || {}
  const fm = (<LogObjectOptions>options).format || DEFAULT_FORMAT
  const nolog = createNoLogCondition((<LogObjectOptions>options).nolog)
  const tokens = (<LogObjectOptions>options).tokens || []
  const levelMapper = (<LogObjectOptions>options).levelMapper || DEFAULT_LEVEL_MAPPER

  return async function(ctx, next) {
    const ctxResponse:CtxResponse = ctx.response

    if (ctxResponse._logging) {
      await next()
      return
    }
    if (nolog && nolog.test(ctx.originalUrl)) {
      await next()
      return
    }
    if ((<LogObjectOptions>options).level === 'auto' || logger.isLevelEnabled(level.levelStr)) {
      const start = new Date().getTime()
      ctxResponse._logging = true
      await next()
      ctxResponse.responseTime = new Date().getTime() - start
      const combineToken = assembleTokens(ctx, tokens)
      if (ctx.res.statusCode && (<LogObjectOptions>options).level === 'auto') {
        level = levelMapper(ctx.res.statusCode)
      }
      if (typeof fm === 'function') {
        const logString = fm(ctx, function(str: string) {
          return format(str, combineToken)
        })
        if (logString) logger.log(level, logString)
      } else {
        logger.log(level, format(fm, combineToken))
      }
    } else {
      await next()
    }

  }
}

function assembleTokens(ctx: Context, customTokens: Token[]): Array<Token> {
  //去重
  const uniqueTokens = (arr: Token[]) => {
    for (let i = 0; i < arr.length; i++) {
      for (let j = i + 1; j < arr.length; j++) {
        if (arr[i].token === arr[j].token) {
          arr.splice(j--, 1)
        }
      }
    }
    return arr
  }
  const ctxResponse:CtxResponse = ctx.response
  const defaultTokens = []
  defaultTokens.push({ token: '$date', replacement: new Date().toUTCString() })

  //request
  defaultTokens.push({ token: '$http-version', replacement: ctx.req.httpVersion })
  defaultTokens.push({ token: '$query', replacement: JSON.stringify(ctx.query || {}) })
  defaultTokens.push({ token: '$params', replacement: JSON.stringify(ctx.params || {}) })

  //response
  defaultTokens.push({ token: '$protocol', replacement: ctx.protocol })
  defaultTokens.push({ token: '$hostname', replacement: ctx.hostname })
  defaultTokens.push({ token: '$method', replacement: ctx.method })
  defaultTokens.push({ token: '$url', replacement: ctx.originalUrl })
  defaultTokens.push({ token: '$response-time', replacement: ctxResponse.responseTime })
  defaultTokens.push({ token: '$status', replacement: ctx.response.status || ctx.res.statusCode })
  defaultTokens.push({
    token: '$remote-addr',
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
    replacement: ctx.ip || ctx.ips || ctx.headers['X-Forwarded-For'] || ctx.headers['x-forwarded-for'] || (ctx.socket && (ctx.socket.remoteAddress || ((<any>ctx.socket).socket && (<any>ctx.socket).socket.remoteAddress)))
  })

  //header
  defaultTokens.push({
    token: '$content-length',
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    replacement: (ctxResponse._headers && ctxResponse._headers['content-length']) || ctx.response.length || '-'
  })
  defaultTokens.push({ token: '$referrer', replacement: ctx.headers['referer'] || '' })
  defaultTokens.push({ token: '$user-agent', replacement: ctx.headers['user-agent'] })
  defaultTokens.push({
    token: /\$req\[(.*)\]/g,
    replacement: function(match: string, field: string) {
      const lowerHeader = convertHead(field, 'toLowerCase')
      const upperHeader = convertHead(field, 'toUpperCase')
      return ctx.response.headers[lowerHeader] || ctx.response.headers[upperHeader] || 'none'
    }
  })
  defaultTokens.push({
    token: /\$res\[(.*)\]/g,
    replacement: function(match: string, field: string) {
      const lowerHeader = convertHead(field, 'toLowerCase')
      const upperHeader = convertHead(field, 'toUpperCase')
      return ctx.response.headers[lowerHeader] || ctx.response.headers[upperHeader] || 'none'
    }
  })
  customTokens = customTokens.map(token => {
    if (token.component && typeof token.component === 'function') {
      token.replacement = token.component
    }
    return token
  })
  return uniqueTokens(customTokens.concat(defaultTokens))
}

/**
 * header头大小写转换
 * @param {String} str header头"Content-Length","content-length"
 * @param {toLowerCase|toUpperCase} type 对应String.toLowerCase()/String.toUpperCase()
 */
function convertHead(str: string, type: 'toLowerCase' | 'toUpperCase') {
  let res = ''
  res = str.replace(/(\w+)/g, (m: string, f: string) => {
    const chart = f.split('')
    chart[0] = chart[0][type]()
    return chart.join('')
  })
  return res
}

/**
 * 格式化日志布局
 * @param {String} str 日志布局
 * @param {Array} tokens token和值得映射关系
 * @return {String} 返回具体日志
 */
function format(str: string, tokens: Array<Token>): string {
  tokens.forEach(token => {
    str = str.replace(token.token, token.replacement)
  })
  return str
}


/**
 * 生成日志过滤规则
 * @param {NoLog|undefined} nolog 过滤日志打印
 * @return {RegExp|null} 返回需要匹配规则正则
 * 1. String
 *  1.1 in "\\.gif"
 *  1.2 in "\\.gif|\\.jpe|\\.png$"
 *  1.3 in "\\.(gif|jpe?g|png)$"
 * 2. RegExp
 *  2.2 in /\.(gif|jpe?g|png)$/
 * 3. Array
 *  3.1 in ["\\.jpg$","\\.gif$","\\.png$"]
 */
function createNoLogCondition(nolog: NoLog | undefined): RegExp | null {
  let reg = null
  if (!nolog) return reg

  if (nolog instanceof RegExp) {
    reg = nolog
  }
  if (typeof nolog === 'string') {
    reg = new RegExp(nolog)
  }
  if (Array.isArray(nolog)) {
    const regexpsAsStrings = nolog.map((item) => (<RegExp>item).source ? (<RegExp>item).source : item)
    reg = new RegExp(regexpsAsStrings.join('|'))
  }
  return reg
}

export const logger = (app: Koa): void => {
  app.use(getLogger(accessLogger, {
    level: 'auto',
    format: '$remote-addr $method $status $url $query $params $res[cache-control]'
  }))
}
