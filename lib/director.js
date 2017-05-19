const debug = require('debug')('director')

const Race = require('./race')

class Director {
  constructor(runner, driver, options) {
    this.runner = runner
    this.driver = driver
    this.options = options

    this.file = ''
    this.race = null
    this.races = []

    const ack = type => () => this.runner.acknowledge(type)

    this.driver.on('status', statusText =>
      this.report('status', statusText)
    )

    this.runner.on('race:start', infos => {
      this.race = new Race(this.file, infos)
      this.report('startRace', this.race)
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
          return this.report('finishRace', this.race)
        })
        .then(ack('race:finish'))
    })
  }

  trace(file) {
    return new Promise(resolve => {
      // no races timeout
      const timerId = setTimeout(() => {
        debug('no races found: %s', file)
        this.report('warn', `No races found in ${file}.`)
        resolve([])
      }, this.options.timeout)

      this.driver.loadFile(file).then(() => {
        debug('file loaded: %s', file)
        this.report('startFile', file)
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
        this.report('finishFile', file)
        resolve(this.races.slice())
      })
    })
  }

  report(type, ...args) {
    return Promise.all(this.reporters.map(
      reporter => () => reporter[type](...args)
    ))
  }
}

module.exports = (runner, driver, { timeout }) => {
  return new Director(runner, driver, { timeout })
}
