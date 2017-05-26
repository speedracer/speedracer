const debug = require('debug')('tracer')

const Driver = require('./driver')
const Runner = require('./runner')
const Race = require('../race')

const Tracer = (driver, runner, options, plugins) => {
  let context
  let races

  const ack = type => () => runner.acknowledge(type)

  driver.on('status', status => (
    plugins.onStatus({ status })
  ))

  runner.on('race:start', infos => (
    plugins.startRace({
      file: context.file,
      race: new Race(context.file, infos),
      categories: driver.getCategories()
    })
    .then(res => {
      context.race = res.race
      driver.setCategories(res.categories)
      driver.startTracing()
    })
    .then(() => plugins.onRaceStart({ race: context.race }))
    .then(
      ack('race:start'),
      ack('race:skip')
    )
  ))

  runner.on('race:finish', () => (
    plugins.onRaceFinish(context)
    .then(() => driver.stopTracing())
    .then(trace => {
      debug('race finished %s (%d trace)', context.race.title, trace.length)
      races.push(context.race)
      context.trace = trace
    })
    .then(plugins.transformTrace(context))
    .then(plugins.onTrace(context))
    .then(plugins.report(context))
    .then(plugins.transformReport(context))
    .then(plugins.onReport(context))
    .then(
      ack('race:finish'),
      ack('race:finish')
    )
  ))

  runner.on('file:start', () => {
    debug('file loaded: %s', context.file)
    return plugins.onFileStart(context)
  })

  runner.on('file:finish', () => {
    debug('total races: %d', races.length)
    return plugins.onFileFinish({ file: context.file })
  })

  debug('ready')

  const trace = file => new Promise(resolve => {
    context = { file: '', race: null, trace: null, report: null }
    races = []

    // no races timeout
    const timerId = setTimeout(() => {
      debug('no races found: %s', file)
      plugins.onWarn({ warning: `No races found in ${file}.` }).then(() => resolve([]))
    }, options.timeout)

    driver.loadFile(file)

    runner.once('race:start', () => {
      debug('clear timeout')
      clearTimeout(timerId)
    })

    runner.once('file:finish', () => {
      resolve(races.slice())
    })
  })

  const dispose = () => {
    driver.dispose()
    runner.dispose()
  }

  return { trace, dispose }
}

module.exports = (options, plugins) => (
  Promise.all([
    Driver(options, plugins),
    Runner(options, plugins)
  ]).then(([ driver, runner ]) => (
    Tracer(driver, runner, { timeout: options.timeout }, plugins)
  ))
)
