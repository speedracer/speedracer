const CRP = require('chrome-remote-interface')
const debug = require('debug')('chrome-remote')

const Chrome = require('./chrome')

module.exports = options => (
  Chrome(options).then(chrome => (
    new Promise((resolve, reject) => (
      CRP(chromeRemote => {
        debug('ready')
        resolve(chromeRemote)
      }).on('error', reject)
    ))
  ))
)
