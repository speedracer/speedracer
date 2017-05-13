// Native
const fs = require('fs')
const zlib = require('zlib')

// Packages
const pify = require('pify')

const flat = xs =>
xs.reduce((res, x) => res.concat(x), [])

const flatMap = (xs, iteratee) =>
xs.reduce((res, x) => res.concat(iteratee(x)), [])

const last = xs =>
xs[xs.length - 1]

const forEachProp = (obj, iteratee) =>
Object.keys(obj).forEach(key => iteratee(obj[key], key))

const pipe = (baton, tasks, error) =>
tasks.reduce(
  (tail, task) => tail.then(task).then(() => baton),
  Promise.resolve(baton)).catch(err => error(err, baton)
)

const readFile = (filename, opts = 'utf8') =>
pify(fs.readFile)(filename, opts)

const writeFile = (filename, data) =>
pify(fs.writeFile)(filename, data)

const createDir = (dirname) =>
pify(fs.mkdir)(dirname).catch(() => {})

const gzip = data =>
pify(zlib.gzip)(data)

const gunzip = data =>
pify(zlib.gunzip)(data)

const toSec = time =>
time / 10e5

module.exports = {
  flat,
  flatMap,
  last,
  forEachProp,
  pipe,
  readFile,
  writeFile,
  createDir,
  gzip,
  gunzip,
  toSec
}
