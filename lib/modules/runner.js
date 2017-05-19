// Native
const EventEmitter = require('events')

// Packages
const debug = require('debug')('runner')
const { Server } = require('ws')

class Runner extends EventEmitter {
  constructor(wss) {
    super()
    this.wss = wss.on('connection', ws => {
      debug('client connected')
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

  onMessage({ type, race, err }) {
    debug('rcv %s %s', type, race && race.title)
    this.emit(type, race, err)
  }
}

module.exports = ({ runnerPort }) =>
  new Promise(resolve => {
    debug('listening on port: %d', runnerPort)
    const wss = new Server({ port: runnerPort })
    resolve(new Runner(wss))
  })
