// Packages
const debug = require('debug')('director')

// Ours
const Race = require('./race')

class Director {
  constructor(runner, driver, reporter, options) {
    this.runner = runner
    this.driver = driver
    this.reporter = reporter
    this.options = options
    this.file = ''
    this.race = null
    this.races = []

    this.reset()
  }

  reset() {
    const ack = type => () => this.runner.acknowledge(type)

    this.races.length = 0

    this.driver.removeAllListeners()
    this.runner.removeAllListeners()

    this.driver.on('status', status =>
      this.reporter.updateStatus(status)
    )

    this.runner.on('race:start', infos => {
      this.race = new Race(this.file, infos)
      this.reporter.startRace(this.race)
      this.driver.startTracing()
        .then(ack('race:start'))
    })

    this.runner.on('race:finish', () => {
      this.driver.stopTracing()
        .then(events => {
          debug('race finished %s (%d events)', this.race.title, events.length)
          this.race.attachEvents(events)
          this.races.push(this.race)
          this.reporter.finishRace(this.race)
          this.race = null
        })
        .then(ack('race:finish'))
    })
  }

  runFile(file) {
    return new Promise(resolve => {
      // no races timeout
      const timerId = setTimeout(() => {
        debug('no races found: %s', file)
        this.reporter.warn(`No races found in ${file}.`)
        resolve(this.races.slice())
        this.reset()
      }, this.options.timeout)

      this.driver.loadFile(file).then(() => {
        debug('file loaded: %s', file)
        this.reporter.startFile(file)
        this.file = file
      })

      this.runner.once('race:start', () => {
        debug('clear timeout')
        clearTimeout(timerId)
      })

      this.runner.once('file:finish', () => {
        debug('total races: %d', this.races.length)
        this.reporter.finishFile(file)
        resolve(this.races.slice())
        this.reset()
      })
    })
  }

  close() {}
}

module.exports = (modules, options) => {
  return new Director(modules.runner, modules.driver, modules.reporter, options)
}
