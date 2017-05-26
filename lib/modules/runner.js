const debug = require('debug')('runner')
const EventEmitter = require('events')

class Runner extends EventEmitter {
  constructor(wss) {
    super()

    this.wss = wss.on('connection', ws => {
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

  close() {
    return new Promise(resolve => this.wss.close(resolve))
  }

  onMessage({ type, race, err }) {
    debug('rcv %s %s', type, race && race.title)
    this.emit(type, race, err)
  }
}

module.exports = (runnerServer) => (
  new Runner(runnerServer)
)
