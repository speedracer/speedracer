const debug = require('debug')('tracer')

const Driver = require('./driver')
const Runner = require('./runner')
const Race = require('../race')

class Tracer {
  constructor(driver, runner, options, plugins) {
    this.driver = driver
    this.runner = runner
    this.options = options
    this.plugins = plugins

    this.context = null
    this.races = null

    this.initialize()
  }

  initialize() {
    const ack = type => () => this.runner.acknowledge(type)

    this.driver.on('status', status => (
      this.plugins.onStatus({ status })
    ))

    this.runner.on('race:start', infos => (
      this.plugins.startRace({
        file: this.context.file,
        race: new Race(this.context.file, infos),
        categories: this.driver.getCategories()
      })
      .then(res => {
        this.context.race = res.race
        this.driver.setCategories(res.categories)
        this.driver.startTracing()
      })
      .then(() => this.plugins.onRaceStart({ race: this.context.race }))
      .then(
        ack('race:start'),
        ack('race:skip')
      )
    ))

    this.runner.on('race:finish', () => (
      this.plugins.onRaceFinish(this.context)
      .then(() => this.driver.stopTracing())
      .then(trace => {
        debug('race finished %s (%d trace)', this.context.race.title, trace.length)
        this.races.push(this.context.race)
        this.context.trace = trace
      })
      .then(this.plugins.transformTrace(this.context))
      .then(this.plugins.onTrace(this.context))
      .then(this.plugins.report(this.context))
      .then(this.plugins.transformReport(this.context))
      .then(this.plugins.onReport(this.context))
      .then(
        ack('race:finish'),
        ack('race:finish')
      )
    ))

    this.runner.on('file:start', () => {
      debug('file loaded: %s', this.context.file)
      return this.plugins.onFileStart(this.context)
    })

    this.runner.on('file:finish', () => {
      debug('total races: %d', this.races.length)
      return this.plugins.onFileFinish({ file: this.context.file })
    })

    debug('ready')
  }

  trace(file) {
    return new Promise(resolve => {
      this.context = { file: '', race: null, trace: null, report: null }
      this.races = []

      // no races timeout
      const timerId = setTimeout(() => {
        debug('no races found: %s', file)
        this.plugins.onWarn({ warning: `No races found in ${file}.` }).then(() => resolve([]))
      }, this.options.timeout)

      this.driver.loadFile(file)

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
