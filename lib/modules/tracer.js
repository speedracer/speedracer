const debug = require('debug')('tracer')

const { PromiseEventEmitter } = require('../.internal/util')
const Driver = require('./driver')
const Runner = require('./runner')
const Race = require('../race')

class Tracer extends PromiseEventEmitter {
  constructor(driver, runner, options) {
    super()

    this.runner = runner
    this.driver = driver
    this.options = options

    this.file = ''
    this.race = null
    this.races = []

    const ack = type => () => this.runner.acknowledge(type)

    this.driver.on('status', status =>
      this.emit('status', status)
    )

    this.runner.on('race:start', infos => {
      this.race = new Race(this.file, infos)
      this.emit('hook:race:start', {
        file: this.file,
        race: this.race,
        categories: this.driver.getCategories()
      })
      .then(() => (
        this.emit('race:start', this.race)
      ))
      .then(() => this.driver.startTracing())
      .then(
        ack('race:start'),
        ack('race:skip')
      )
    })

    this.runner.on('race:finish', () => {
      this.driver.stopTracing()
      .then(events => {
        debug('race finished %s (%d events)', this.race.title, events.length)
        // this.race.attachEvents(events)
        // this.race.createReport()
        this.races.push(this.race)
        return events
      })
      .then(events => this.emit('hook:report', {
        file: this.file,
        race: this.race,
        events
      }))
      .then(() => (
        this.emit('race:finish', this.race)
      ))
      .then(
        ack('race:finish'),
        ack('race:finish')
      )
    })

    debug('ready')
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

module.exports = (options, plugins) => (
  Promise.all([
    Driver(options, plugins),
    Runner(options, plugins)
  ]).then(([ driver, runner ]) => (
    new Tracer(driver, runner, { timeout: options.timeout }, plugins)
  ))
)
