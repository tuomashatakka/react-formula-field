/* eslint no-console: 0 */
global.RUNTIME   = 'server'

import Koa from 'koa'
import open from 'opn'
import prompt from 'prompts'
import parser from 'koa-bodyparser'

import serve from './frontend'


const port     = 3000

const printError = descriptor => error =>
  console.log(descriptor, error)

const openLocalhost = () =>
  open(`http://localhost:${port}`)

const promptBrowserOpen = () => should('Open browser?')
  .then(openLocalhost)
  .catch(printError(`No browser opened`))

const start = () =>
  startServer(port)
    // .then(promptBrowserOpen)
    // .catch(printError(`Error in starting server .-.`))


start()


async function startServer (port) {

  const app = new Koa()
  app.use(parser())
  app.use(await serve.bundle)
  app.use(serve.page)

  const resolver = (resolve, reject) =>
    app.listen(port, error => error
      ? reject(error)
      : resolve(app)
    )

  return new Promise(resolver)
}


async function should (message) {
  const { value } = await prompt({
    message,
    type: 'select',
    name: 'value',
    choices: [
      {
        title: 'Yes',
        value: true,
      },
      {
        title: 'No',
        value: false,
      },
    ]
  })

  if (value)
    return value
  // throw new Error(null)
}
