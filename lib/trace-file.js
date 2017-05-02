// Packages
const debug = require('debug')('trace-file')

const traceFile = (file, runner, driver) =>
new Promise((resolve, reject) => {
  const ack = type => () => runner.acknowledge(type)

  const runs = []
  let currentRun = null

  driver.loadFile(file).then(() => {
    runner.on('run:start', run => {
      currentRun = run
      driver.startTracing()
        .then(ack('run:start'))
    })

    runner.on('run:end', () => {
      driver.stopTracing()
        .then(events => {
          debug('run ended %s (%d events)', currentRun.title, events.length)
          currentRun.events = events
          runs.push(currentRun)
          currentRun = null
        })
        .then(ack('run:end'))
    })

    runner.on('file:end', () => {
      debug('total runs: %d', runs.length)
      resolve(runs)
    })
  })
})

module.exports = traceFile
