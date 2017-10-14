const pify = require('pify')
const fs = require('fs')
const { partialRight } = require('lodash')

const readFile = partialRight(pify(fs.readFile), 'utf8')

module.exports = readFile
