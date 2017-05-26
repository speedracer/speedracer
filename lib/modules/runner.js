const debug = require('debug')('runner')
const EventEmitter = require('events')

const RunnerServer = require('./runner-server')

class Runner extends EventEmitter {
  constructor(server) {
    super()

    this.server = server.on('connection', ws => {
      debug('client connected')
      this.ws = ws.on('message', payload => {
        this.onMessage(JSON.parse(payload))
      })
    })

    debug('ready')
  }

  acknowledge(type) {
    debug('ack %s', type)
    this.ws.send(JSON.stringify({ type: `${type}:ack` }))
  }

  dispose() {
    this.server.close()
  }

  onMessage({ type, race, err }) {
    debug('rcv %s %s', type, race && race.title)
    this.emit(type, race, err)
  }
}

module.exports = (options, plugins) => (
  RunnerServer(options).then(runnerServer => (
    new Runner(runnerServer)
  ))
)
