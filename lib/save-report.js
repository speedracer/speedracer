// Native
const fs = require('fs')

// Packages
const pify = require('pify')

const saveReport = (filename, report) => {
  return pify(fs.writeFile)(filename, JSON.stringify(report, null, 2))
}

module.exports = saveReport
