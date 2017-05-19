const fs = require('fs')
const pify = require('pify')
const zlib = require('zlib')

const flat = xs => (
  xs.reduce((res, x) => res.concat(x), [])
)

const flatMap = (xs, iteratee) => (
  xs.reduce((res, x) => res.concat(iteratee(x)), [])
)

const arrify = xs => (
  Array.isArray(xs) ? xs : [xs]
)

const union = (xs, ys) => (
  Array.from(new Set(xs.concat(ys)))
)

const last = xs => (
  xs[xs.length - 1]
)

const eachProp = (obj, iteratee) => Object.keys(obj).forEach(
  key => iteratee(obj[key], key)
)

const pipe = (baton, tasks, error) => tasks.reduce(
  (tail, task) => tail.then(task).then(() => baton),
  Promise.resolve(baton)).catch(err => error(err, baton)
)

const readFile = (filename, opts = 'utf8') => (
  pify(fs.readFile)(filename, opts)
)

const writeFile = (filename, data) => (
  pify(fs.writeFile)(filename, data)
)

const fileExists = (filename) => (
  pify(fs.stat)(filename)
)

const createDir = (dirname) => (
  pify(fs.mkdir)(dirname).catch(() => {})
)

const gzip = data => (
  pify(zlib.gzip)(data)
)

const gunzip = data => (
  pify(zlib.gunzip)(data)
)

const toSec = time => (
  time / 10e5
)

module.exports = {
  flat,
  flatMap,
  arrify,
  union,
  last,
  eachProp,
  pipe,
  readFile,
  writeFile,
  fileExists,
  createDir,
  gzip,
  gunzip,
  toSec
}
