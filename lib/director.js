// Packages
const debug = require('debug')('director')

// Ours
const Run = require('./run')

class Director {
  constructor(runner, driver, reporter) {
    this.runner = runner
    this.driver = driver
    this.reporter = reporter
    this.file = ''
    this.run = null
    this.runs = []

    this.reset()
  }

  reset() {
    const ack = type => () => this.runner.acknowledge(type)

    this.driver.removeAllListeners()
    this.runner.removeAllListeners()

    this.driver.on('status', status =>
      this.reporter.updateStatus(status)
    )

    this.runner.on('run:start', infos => {
      this.run = new Run(this.file, infos)
      this.reporter.startRun(this.run)
      this.driver.startTracing()
        .then(ack('run:start'))
    })

    this.runner.on('run:end', () => {
      this.driver.stopTracing()
        .then(events => {
          debug('run ended %s (%d events)', this.run.title, events.length)
          this.run.attachEvents(events)
          this.runs.push(this.run)
          this.reporter.finishRun(this.run)
          this.run = null
        })
        .then(ack('run:end'))
    })
  }

  runFile(file) {
    return new Promise(resolve => {
      // no runs timeout
      const timerId = setTimeout(() => {
        debug('no runs found: %s', file)
        this.reporter.warn(`No runs found in ${file}.`)
        this.reset()
        resolve(this.runs)
      }, 1000)

      this.driver.loadFile(file).then(() => {
        debug('file loaded: %s', file)
        this.reporter.startFile(file)
        this.file = file
      })

      this.runner.once('run:start', () => {
        debug('clear timeout')
        clearTimeout(timerId)
      })

      this.runner.once('file:end', () => {
        debug('total runs: %d', this.runs.length)
        this.reporter.finishFile(file)
        this.reset()
        resolve(this.runs)
      })
    })
  }

  close() {}
}

module.exports = modules => {
  return new Director(modules.runner, modules.driver, modules.reporter)
}
