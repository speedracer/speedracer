const debug = require('debug')('tracer')
const EventEmitter = require('event-as-promised')

const Race = require('./race')

class Tracer extends EventEmitter {
  constructor(runner, driver, options) {
    super()

    this.runner = runner
    this.driver = driver
    this.options = options

    this.file = ''
    this.race = null
    this.races = []

    const ack = type => () => this.runner.acknowledge(type)

    this.driver.on('status', statusText =>
      this.emit('status', statusText)
    )

    this.runner.on('race:start', infos => {
      this.race = new Race(this.file, infos)
      this.emit('race:start', this.race)
        .then(() => this.driver.startTracing())
        .then(ack('race:start'))
    })

    this.runner.on('race:finish', () => {
      this.driver.stopTracing()
        .then(events => {
          debug('race finished %s (%d events)', this.race.title, events.length)
          this.race.attachEvents(events)
          this.race.createReport()
          this.races.push(this.race)
          return this.emit('race:finish', this.race)
        })
        .then(ack('race:finish'))
    })
  }

  trace(file) {
    return new Promise(resolve => {
      // no races timeout
      const timerId = setTimeout(() => {
        debug('no races found: %s', file)
        this.emit('warn', `No races found in ${file}.`)
        resolve([])
      }, this.options.timeout)

      this.driver.loadFile(file).then(() => {
        debug('file loaded: %s', file)
        this.emit('file:start', file)
        this.file = file
        this.race = null
        this.races.length = 0
      })

      this.runner.once('race:start', () => {
        debug('clear timeout')
        clearTimeout(timerId)
      })

      this.runner.once('file:finish', () => {
        debug('total races: %d', this.races.length)
        this.emit('file:finish', file)
        resolve(this.races.slice())
      })
    })
  }
}

module.exports = (runner, driver, { timeout }) => {
  return new Tracer(runner, driver, { timeout })
}
