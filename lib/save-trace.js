// Native
const fs = require('fs')
const zlib = require('zlib')

// Packages
const pify = require('pify')

const saveTrace = (filename, events) =>
  pify(zlib.gzip)(JSON.stringify(events, null, 2))
    .then(buf => pify(fs.writeFile)(filename, buf))

module.exports = saveTrace
