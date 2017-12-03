import fastGlob from 'fast-glob'

export default async function FileSystemResolver(options) {
  return function resolve(globs) {
    return fastGlob(globs, options)
  }
}
