import fs from 'fs'
import webpack from 'webpack'
import middleware from 'koa-webpack'
import config from '../../config/webpack'
import paths from '../meta'

function servePageMiddleware (context) {
  if (context.response.status === 404) {
    context.response.type = 'html'
    context.response.body = fs.createReadStream(paths.index)
  }
  return context
}

async function compileBundleMiddleware () {
  const compiler    = webpack(config)
  const options     = {
    compiler,
    devMiddleware:  config.devServer,
    hotClient:      {
      logLevel:     'silent',
      // path:         '/delta',
    }
  }
  return await middleware(options)
}


Object.defineProperties(exports, {
  page: { value: servePageMiddleware },
  bundle: { get: compileBundleMiddleware },
})
