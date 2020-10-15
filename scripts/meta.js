/* eslint no-console: 0 */
import { resolve } from 'path'

const path = (p) =>
  resolve(__dirname, `../${p}`)


module.exports = {
  root:   path(''),
  index:  path('src/index.html'),
  build:  path('dist'),
  server: path('scripts/serve'),
  source: path('src'),
  config: path('config'),
  public: path('public'),
}
