// Native
const fs = require('fs')
const zlib = require('zlib')

// Packages
const pify = require('pify')

const forEachProp = (obj, iteratee) => {
  Object.keys(obj).forEach(key => iteratee(obj[key], key))
}

const gzip = data => pify(zlib.gzip)(data)

const readFile = filename => pify(fs.readFile)(filename, 'utf8')

const writeFile = (filename, data) => pify(fs.writeFile)(filename, data)

module.exports = { forEachProp, gzip, readFile, writeFile }
