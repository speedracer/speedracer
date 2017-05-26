const debug = require('debug')('runner-server')
const { Server } = require('ws')

module.exports = ({ runnerPort }) => {
  debug('listening on port: %d', runnerPort)
  return new Server({ port: runnerPort })
}
