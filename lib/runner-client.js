class RunnerClient {
  constructor() {
    this.port = 3001
    this.ws = new WebSocket(`ws://localhost:${this.port}`)
    this.router = {
      'run:start:ack': () => this.startRun(),
      'run:end:ack': () => this.runNext()
    }
    this.runs = []

    this.ws.onopen = () => {
      this.ws.onmessage = ({ data }) => this.onMessage(JSON.parse(data))
      this.send('file:start')
      this.runNext()
    }
  }

  enqueueRun(title, fn) {
    this.runs.push({ title, fn })
  }

  runNext() {
    this.currentRun = this.runs.shift()

    if (this.currentRun) {
      this.send('run:start', this.currentRun)
    }
    else {
      this.send('file:end')
      this.ws.close()
    }
  }

  startRun() {
    try {
      const res = this.currentRun.fn()
      if (res && res.then) {
        res.then(() => this.endRun())
      }
      else {
        this.endRun()
      }
    }
    catch (err) {
      this.runError(err)
    }
  }

  endRun() {
    this.send('run:end', this.currentRun)
  }

  runError(err) {
    this.send('run:error', this.currentRun, err)
    this.endRun()
  }

  onMessage(payload) {
    const { type } = payload
    const handler = this.router[type]
    if (handler) {
      handler()
    }
  }

  send(type, run, err) {
    const payload = { type }
    if (run) payload.run = run
    if (err) payload.err = err
    this.ws.send(JSON.stringify(payload))
  }
}

const runner = new RunnerClient()

module.exports = (title, fn) =>
runner.enqueueRun(title, fn)

// For test purposes
module.exports.RunnerClient = RunnerClient
