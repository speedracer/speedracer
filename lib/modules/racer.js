const debug = require('debug')('racer')

const Driver = require('./driver')
const Runner = require('./runner')

class Racer {
  constructor(driver, runner, options, plugins) {
    this.driver = driver
    this.runner = runner
    this.options = options
    this.plugins = plugins

    this.baton = null
    this.totalRaces = 0

    this.initialize()
  }

  initialize() {
    const ack = type => () => this.runner.acknowledge(type)
    const drive = type => () => this.driver[type]()
    const plug = type => () => this.plugins[type](this.baton)
    const store = name => val => { this.baton[name] = val }

    this.driver.on('status', status => (
      this.plugins.onStatus({ status })
    ))

    this.runner.on('race:start', race => Promise.resolve(race)
      .then(store('race'))
      .then(plug('startRace'))
      .then(() => this.driver.setCategories(this.baton.categories))
      .then(drive('startTracing'))
      .then(plug('onRaceStart'))
      .then(ack('race:start'), ack('race:skip'))
    )

    this.runner.on('race:finish', () => Promise.resolve()
      .then(plug('onRaceFinish'))
      .then(drive('stopTracing'))
      .then(store('trace'))
      .then(() => {
        const { race, trace } = this.baton
        debug('race finished %s (%d trace events)', race.title, trace.length)
        this.totalRaces++
      })
      .then(plug('transformTrace'))
      .then(store('trace'))
      .then(plug('onTrace'))
      .then(plug('report'))
      .then(store('report'))
      .then(plug('transformReport'))
      .then(store('report'))
      .then(plug('onReport'))
      .then(ack('race:finish'), ack('race:finish'))
    )

    this.runner.on('file:start', () => {
      debug('file loaded: %s', this.baton.file)
      return this.plugins.onFileStart(this.baton)
    })

    this.runner.on('file:finish', () => {
      debug('total races: %d', this.totalRaces)
      return this.plugins.onFileFinish({ file: this.baton.file })
    })

    debug('ready')
  }

  trace(file) {
    this.baton = {
      file,
      race: null,
      trace: null,
      report: null,
      categories: this.driver.getCategories()
    }

    this.driver.loadFile(file)

    return new Promise(resolve => {
      // no races timeout
      const timerId = setTimeout(() => {
        debug('no races found: %s', file)
        this.plugins.onWarn({ warning: `No races found in ${file}.` }).then(resolve)
      }, this.options.timeout)

      this.runner.once('race:start', () => {
        debug('clear timeout')
        clearTimeout(timerId)
      })

      this.runner.once('file:finish', resolve)
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
    new Racer(driver, runner, { timeout: options.timeout }, plugins)
  ))
)
