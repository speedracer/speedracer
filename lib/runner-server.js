// Native
const EventEmitter = require('events')

// Packages
const debug = require('debug')('runner-server')
const { Server } = require('ws')

class RacingServer extends EventEmitter {
  constructor(wss) {
    super()
    this.wss = wss.on('connection', ws => {
      this.ws = ws.on('message', payload => {
        this.onMessage(JSON.parse(payload))
      })
    })
  }

  acknowledge(type) {
    debug('ack %s', type)
    this.ws.send(JSON.stringify({ type: `${type}:ack` }))
  }

  close() {
    return new Promise(resolve => this.wss.close(resolve))
  }

  onMessage({ type, run, err }) {
    debug('rcv %s %s', type, run && run.title)
    this.emit(type, run, err)
  }
}

module.exports = ({ port }) =>
  new Promise(resolve => {
    const wss = new Server({ port })
    resolve(new RacingServer(wss))
  })
