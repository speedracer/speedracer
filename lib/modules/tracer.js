const debug = require('debug')('tracer')

const { PromiseEventEmitter } = require('../.internal/util')
const Driver = require('./driver')
const Runner = require('./runner')
const Race = require('../race')

class Tracer extends PromiseEventEmitter {
  constructor(driver, runner, options, plugins) {
    super()

    this.driver = driver
    this.runner = runner
    this.options = options
    this.plugins = plugins

    this.file = ''
    this.race = null
    this.races = []

    const ack = type => () => this.runner.acknowledge(type)

    this.driver.on('status', status =>
      plugins.onStatus({ status })
    )

    this.runner.on('race:start', infos => {
      plugins.startRace({
        file: this.file,
        race: new Race(this.file, infos),
        categories: this.driver.getCategories()
      })
      .then(({ race, categories }) => {
        this.race = race
        this.driver.setCategories(categories)
        this.driver.startTracing()
        return race
      })
      .then(race => plugins.onRaceStart({ race }).then(() => race))
      .then(
        ack('race:start'),
        ack('race:skip')
      )
    })

    this.runner.on('race:finish', () => {
      this.driver.stopTracing()
      .then(trace => {
        debug('race finished %s (%d trace)', this.race.title, trace.length)
        this.races.push(this.race)
        return plugins.onRaceFinish({ race: this.race }).then(() => trace)
      })
      .then(trace => plugins.transformTrace({
        file: this.file,
        race: this.race,
        trace
      }))
      .then(trace => plugins.onTrace({
        file: this.file,
        race: this.race,
        trace
      }).then(() => trace))
      .then(trace => plugins.report({
        file: this.file,
        race: this.race,
        trace
      }))
      .then(report => plugins.onReport({
        file: this.file,
        race: this.race,
        report
      }).then(() => report))
      .then(report => plugins.transformReport({
        file: this.file,
        race: this.race,
        report
      }))
      .then(
        ack('race:finish'),
        ack('race:finish')
      )
    })

    this.runner.on('file:finish', () => {
      debug('total races: %d', this.races.length)
      return plugins.onFileFinish({ file: this.file })
    })

    debug('ready')
  }

  trace(file) {
    return new Promise(resolve => {
      // no races timeout
      const timerId = setTimeout(() => {
        debug('no races found: %s', file)
        this.plugins.onWarn({ warning: `No races found in ${file}.` }).then(() => resolve([]))
      }, this.options.timeout)

      this.driver.loadFile(file).then(() => {
        debug('file loaded: %s', file)
        this.file = file
        this.race = null
        this.races.length = 0
        this.plugins.onFileStart({ file: this.file })
      })

      this.runner.once('race:start', () => {
        debug('clear timeout')
        clearTimeout(timerId)
      })

      this.runner.once('file:finish', () => {
        resolve(this.races.slice())
      })
    })
  }

  dispose() {
    this.driver.dispose()
    this.runner.dispose()
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
