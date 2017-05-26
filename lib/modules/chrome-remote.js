const CRP = require('chrome-remote-interface')
const debug = require('debug')('chrome-remote')

module.exports = options => (
  new Promise((resolve, reject) => (
    CRP(chromeRemote => {
      debug('ready')
      resolve(chromeRemote)
    }).on('error', reject)
  ))
)
