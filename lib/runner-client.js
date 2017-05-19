class RunnerClient {
  constructor() {
    this.port = 3001
    this.ws = new WebSocket(`ws://localhost:${this.port}`)
    this.router = {
      'race:start:ack': () => this.startRace(),
      'race:finish:ack': () => this.next(),
      'race:skip:ack': () => this.next()
    }
    this.races = []

    this.ws.onopen = () => {
      this.ws.onmessage = ({ data }) => this.onMessage(JSON.parse(data))
      this.send('file:start')
      this.next()
    }
  }

  enqueueRace(title, fn) {
    this.races.push({ title, fn })
  }

  next() {
    this.currentRace = this.races.shift()

    if (this.currentRace) {
      this.send('race:start', this.currentRace)
    }
    else {
      this.send('file:finish')
      this.ws.close()
    }
  }

  startRace() {
    try {
      const res = this.currentRace.fn()
      if (res && res.then) {
        res.then(() => this.finishRace())
      }
      else {
        this.finishRace()
      }
    }
    catch (err) {
      this.raceError(err)
    }
  }

  finishRace() {
    this.send('race:finish', this.currentRace)
  }

  raceError(err) {
    this.send('race:error', this.currentRace, err)
    this.finishRace()
  }

  onMessage(payload) {
    const { type } = payload
    const handler = this.router[type]
    if (handler) {
      handler()
    }
  }

  send(type, race, err) {
    const payload = { type }
    if (race) payload.race = race
    if (err) payload.err = err
    this.ws.send(JSON.stringify(payload))
  }
}

const runner = new RunnerClient()

module.exports = (title, fn) =>
runner.enqueueRace(title, fn)

// For test purposes
module.exports.RunnerClient = RunnerClient
