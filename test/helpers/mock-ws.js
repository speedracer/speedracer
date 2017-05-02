// Packages
import sinon from 'sinon'

global.WebSocket = class WebSocket {
  constructor() {
    setImmediate(() => this.onopen())

    this.send = sinon.spy(this.send)
  }

  send(payload) {
    payload = JSON.parse(payload)
    payload.type += ':ack'
    payload = JSON.stringify(payload)
    this.onmessage({ data: payload })
  }
}
