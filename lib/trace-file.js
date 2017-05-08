// Packages
const debug = require('debug')('trace-file')

// Ours
const Run = require('./run')

const traceFile = (file, { runner, driver, reporter }) =>
new Promise((resolve, reject) => {
  const ack = type => () => runner.acknowledge(type)

  const runs = []
  let currentRun = null
  let timerId = null

  reporter.startFile(file)

  driver.on('status', status => reporter.updateStatus(status))

  driver.loadFile(file).then(() => {
    runner.on('run:start', infos => {
      clearTimeout(timerId)
      currentRun = new Run(file, infos)
      reporter.startRun(currentRun)
      driver.startTracing()
        .then(ack('run:start'))
    })

    runner.on('run:end', () => {
      driver.stopTracing()
        .then(events => {
          debug('run ended %s (%d events)', currentRun.title, events.length)
          currentRun.attachEvents(events)
          runs.push(currentRun)
          reporter.finishRun(currentRun)
          currentRun = null
        })
        .then(ack('run:end'))
    })

    runner.on('file:end', () => {
      debug('total runs: %d', runs.length)
      reporter.finishFile(file)
      resolve(runs)
    })

    // no runs timeout
    timerId = setTimeout(() => {
      debug('no runs found: %s', file)
      reporter.warn(`No runs found in ${file}.`)
      resolve(runs)
    }, 1000)
  })
})

module.exports = traceFile
