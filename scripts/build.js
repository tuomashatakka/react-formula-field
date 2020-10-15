/* eslint no-console: 0 */
import webpack from 'webpack'
import config from '../config/webpack'


webpack(config, handleResults)


function handleResults (error, stats) {

  if (error)
    return console.error(
      "Error while compiling",
      error.stack || error,
      error.details || '')

  const info = stats.toJson()

  if (stats.hasErrors())
    console.error(
      "Compiled with errors",
      info.errors)

  if (stats.hasWarnings())
    console.warn(
      "Compiled with warnings",
      info.warnings)
}
