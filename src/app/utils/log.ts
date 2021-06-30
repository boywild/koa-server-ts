import { Middleware, Context } from 'koa'
import { levels, Logger, Level } from 'log4js'
import * as Koa from 'koa'
import { accessLogger } from '../utils/log4js'

const DEFAULT_FORMAT = ':remote-addr - -' +
  ' ":method :url HTTP/:http-version"' +
  ' :status :content-length ":referrer"' +
  ' ":user-agent"'

const DEFAULT_LEVEL_MAPPER = function(statusCode: number): Level {
  if (statusCode >= 400)
    return levels.ERROR
  if (statusCode >= 300)
    return levels.WARN
  return levels.INFO
}

/**
 * Log requests with the given `options` or a `format` string.
 * Use for Koa v1
 *
 * Options:
 *
 *   - `format`        Format string, see below for tokens
 *   - `level`         A log4js levels instance. Supports also 'auto'
 *
 * Tokens:
 *
 *   - `:req[header]` ex: `:req[Accept]`
 *   - `:res[header]` ex: `:res[Content-Length]`
 *   - `:http-version`
 *   - `:response-time`
 *   - `:remote-addr`
 *   - `:date`
 *   - `:method`
 *   - `:url`
 *   - `:referrer`
 *   - `:user-agent`
 *   - `:status`
 *
 * @param {String|Function|Object} format or options
 * @return {Function}
 * @api public
 */

interface Token {
  token: string | RegExp
  replacement: string | Function
  content?: Function
}

interface LogObjectOptions {
  level: string
  format?: string | Function
  nolog?: IgnoreLog
  tokens?: Array<Token>
  levelMapper?: Function
}

interface LogStringOptions {
  format: string
}

type LogOptions = LogObjectOptions | LogStringOptions | {}
type IgnoreLog = string | Array<string | RegExp> | RegExp

function getKoaLogger(logger4js: Logger, options: LogOptions): Middleware {
  if (typeof options === 'object') {
    options = options || {}
  } else if (options) {
    options = { format: options }
  } else {
    options = {}
  }

  let thislogger = logger4js
  let level = levels.getLevel((<LogObjectOptions>options).level)
  let fmt = (<LogObjectOptions>options).format || DEFAULT_FORMAT
  let nolog = (<LogObjectOptions>options).nolog ? createNoLogCondition((<LogObjectOptions>options).nolog) : null
  let levelMapper = (<LogObjectOptions>options).levelMapper || DEFAULT_LEVEL_MAPPER

  return async (ctx, next) => {
    const ctxRequest = ctx.request as any
    const ctxResponse = ctx.response as any
    // mount safety
    if (ctxRequest._logging) {
      await next()
      return
    }

    // nologs
    if (nolog && nolog.test(ctx.originalUrl)) {
      await next()
      return
    }
    if ((<LogObjectOptions>options).level === 'auto' || thislogger.isLevelEnabled(level.levelStr)) {
      let start: number = new Date().getTime()
      let writeHead = ctxResponse.writeHead

      // flag as logging
      ctxRequest._logging = true

      // proxy for statusCode.
      ctxResponse.writeHead = function(code: number, headers: {}) {
        ctxResponse.writeHead = writeHead
        ctxResponse.writeHead(code, headers)
        ctxResponse.__statusCode = code
        ctxResponse.__headers = headers || {}

        // status code response level handling
        if ((<LogObjectOptions>options).level === 'auto') {
          level = levelMapper(code)
        } else {
          level = levels.getLevel((<LogObjectOptions>options).level)
        }
      }

      await next()
      // hook on end request to emit the log entry of the HTTP request.
      ctxResponse.responseTime = new Date().getTime() - start
      // status code response level handling
      if (ctx.res.statusCode && (<LogObjectOptions>options).level === 'auto') {
        level = levelMapper(ctx.res.statusCode)
      }
      if (thislogger.isLevelEnabled(level.levelStr)) {
        let combinedTokens = assembleTokens(ctx, (<LogObjectOptions>options).tokens || [])
        if (typeof fmt === 'function') {
          let line = fmt(ctx, function(str: string) {
            return format(str, combinedTokens)
          })
          if (line) thislogger.log(level, line)
        } else {
          thislogger.log(level, format(fmt, combinedTokens))
        }
      }
    } else {
      // ensure next gets always called
      await next()
    }
  }
}

/**
 * Adds custom {token, replacement} objects to defaults, overwriting the defaults if any tokens clash
 *
 * @param  {Koa Context} ctx
 * @param  {Array} customTokens [
 *                      {
 *                        token: string-or-regexp,
 *                        replacement: string-or-replace-function,
 *                        content: a replace function with `ctx`
 *                      }
 *                 ]
 * @return {Array}
 */


function assembleTokens(ctx: Context, customTokens: Array<Token>): Array<Token> {
  let arrayUniqueTokens = function(array: Array<Token>) {
    let a = array.concat()
    for (let i = 0; i < a.length; ++i) {
      for (let j = i + 1; j < a.length; ++j) {
        if (a[i].token === a[j].token) { // not === because token can be regexp object
          a.splice(j--, 1)
        }
      }
    }
    return a
  }
  const ctxResponse = ctx.response as any
  let defaultTokens = []
  defaultTokens.push({ token: ':url', replacement: ctx.originalUrl })
  defaultTokens.push({ token: ':protocol', replacement: ctx.protocol })
  defaultTokens.push({ token: ':hostname', replacement: ctx.hostname })
  defaultTokens.push({ token: ':method', replacement: ctx.method })
  defaultTokens.push({
    token: ':status',
    replacement: ctx.response.status || ctxResponse.__statusCode || ctx.res.statusCode
  })
  defaultTokens.push({ token: ':response-time', replacement: ctxResponse.responseTime })
  defaultTokens.push({ token: ':date', replacement: new Date().toUTCString() })
  defaultTokens.push({ token: ':referrer', replacement: ctx.headers.referer || '' })
  defaultTokens.push({ token: ':http-version', replacement: ctx.req.httpVersionMajor + '.' + ctx.req.httpVersionMinor })
  defaultTokens.push({
    token: ':remote-addr',
    replacement: ctx.headers['x-forwarded-for'] || ctx.ip || ctx.ips ||
      (ctx.socket && (ctx.socket.remoteAddress || ((<any>ctx.socket).socket && (<any>ctx.socket).socket.remoteAddress)))
  })
  defaultTokens.push({ token: ':user-agent', replacement: ctx.headers['user-agent'] })
  defaultTokens.push({
    token: ':content-length',
    replacement: (ctxResponse._headers && ctxResponse._headers['content-length']) ||
      (ctxResponse.__headers && ctxResponse.__headers['Content-Length']) ||
      ctx.response.length || '-'
  })
  defaultTokens.push({
    token: /:req\[([^\]]+)\]/g,
    replacement: function(_: string, field: string) {
      return ctx.headers[field.toLowerCase()]
    }
  })
  defaultTokens.push({
    token: /:res\[([^\]]+)\]/g,
    replacement: function(_: string, field: string) {
      return ctxResponse._headers
        ? (ctxResponse._headers[field.toLowerCase()] || ctxResponse.__headers[field])
        : (ctxResponse.__headers && ctxResponse.__headers[field])
    }
  })

  customTokens = customTokens.map(function(token) {
    if (token.content && typeof token.content === 'function') {
      token.replacement = token.content(ctx)
    }
    return token
  })

  return arrayUniqueTokens(customTokens.concat(defaultTokens))
}

/**
 * Return formatted log line.
 *
 * @param  {String} str
 * @param  {IncomingMessage} req
 * @param  {ServerResponse} res
 * @return {String}
 * @api private
 */

function format(str: string, tokens: Array<Token>): string {
  for (let i = 0; i < tokens.length; i++) {
    str = str.replace(tokens[i].token, <string>tokens[i].replacement)
  }
  return str
}

/**
 * Return RegExp Object about nolog
 *
 * @param  {String} nolog
 * @return {RegExp}
 * @api private
 *
 * syntax
 *  1. String
 *   1.1 "\\.gif"
 *         NOT LOGGING http://example.com/hoge.gif and http://example.com/hoge.gif?fuga
 *         LOGGING http://example.com/hoge.agif
 *   1.2 in "\\.gif|\\.jpg$"
 *         NOT LOGGING http://example.com/hoge.gif and
 *           http://example.com/hoge.gif?fuga and http://example.com/hoge.jpg?fuga
 *         LOGGING http://example.com/hoge.agif,
 *           http://example.com/hoge.ajpg and http://example.com/hoge.jpg?hoge
 *   1.3 in "\\.(gif|jpe?g|png)$"
 *         NOT LOGGING http://example.com/hoge.gif and http://example.com/hoge.jpeg
 *         LOGGING http://example.com/hoge.gif?uid=2 and http://example.com/hoge.jpg?pid=3
 *  2. RegExp
 *   2.1 in /\.(gif|jpe?g|png)$/
 *         SAME AS 1.3
 *  3. Array
 *   3.1 ["\\.jpg$", "\\.png", "\\.gif"]
 *         SAME AS "\\.jpg|\\.png|\\.gif"
 */

function createNoLogCondition(nolog: IgnoreLog | undefined): RegExp | null {
  let regexp = null
  if (nolog) {
    if (nolog instanceof RegExp) {
      regexp = nolog
    }

    if (typeof nolog === 'string') {
      regexp = new RegExp(nolog)
    }

    if (Array.isArray(nolog)) {
      let regexpsAsStrings = nolog.map((o) => ((o as RegExp).source ? (o as RegExp).source : o))
      regexp = new RegExp(regexpsAsStrings.join('|'))
    }
  }

  return regexp
}

export const logger = (app: Koa): void => {
  app.use(getKoaLogger(accessLogger, { level: 'auto' }))
}
