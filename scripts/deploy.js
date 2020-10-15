import mkdir from 'mkdirp'
import { createReadStream, createWriteStream, readdirSync as readdir, statSync as stat } from 'fs'
import { resolve } from 'path'
import path from './meta'


async function createPublicDirectory () {
  await mkdir(path.public)
}


async function getScriptFiles () {

  const mapFilenameToEntry = name => ({
    name,
    path: resolve(path.build, name) })

  const isFile = async entry => {
    const stats = stat(entry.path)
    return stats.isFile()
  }

  const entries = readdir(path.build).map(mapFilenameToEntry)
  const files = entries.filter(isFile)
  return await Promise.all(files)
}


function copyFile (source, target) {
  const read = createReadStream(source)
  const write = createWriteStream(target)
  return new Promise((resolve, reject) => {
    read.on("error", reject)
    write.on("error", reject)
    write.on("close", resolve)
    read.pipe(write)
  })
}


async function copyStaticAsset (source, target) {
  const src = resolve(path.root, source)
  const dst = resolve(path.public, target)
  return await copyFile(src, dst)
}


async function __main__ () {
  try {
    await createPublicDirectory()
    await copyStaticAsset(path.source + '/index.html', 'index.html')
  }
  catch (error) {
    return {
      success: false,
      status:  `Could not create the public folder.`,
      error
    }
  }

  try {
    const built = await getScriptFiles()
    for (let entry of built)
      copyStaticAsset(entry.path, entry.name)
    return {
      success: true,
      status:  `Deployment successful.`,
    }
  }
  catch (error) {
    return {
      success: false,
      status:  `Failed to copy the dist folder's contents into the public folder.`,
      error
    }
  }
}


__main__()
  .then(result => {
    if (result.success)
      return console.log(result.status)
    console.error(result.status)
    console.error(result.error)
  })
