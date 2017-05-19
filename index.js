const defaults = require('object-defaults')
const globby = require('globby')
const mapSeries = require('p-map-series')
const path = require('path')
const waterfall = require('p-waterfall')

const { eachProp, pipe } = require('./lib/.internal/util')
const createDriver = require('./lib/modules/driver')
const createRunnerServer = require('./lib/modules/runner-server')
const createTracer = require('./lib/modules/tracer')
const launchChrome = require('./lib/modules/chrome-launcher')
const startServer = require('./lib/modules/server')

const plugEvent = (plugins, event) => (...args) => (
  plugins.map(plugin => {
    const fn = plugin[event]
    if (fn) fn.apply(plugin, args)
  })
)

const plugHook = (plugins, hook) => params => (
  waterfall(plugins.map(plugin => params => {
    const fn = plugin[hook]
    if (fn) {
      const ret = fn.call(plugin, params)
      if (ret === false) throw Object({ skip: true })
      return (ret || params)
    }
    return params
  }), params)
)

const cleanup = ({ modules }) => (
  eachProp(modules, m => {
    if (m && m.close) m.close()
  })
)

const load = baton => (
  globby(baton.files).then(paths => {
    if (paths.length === 0) {
      throw new Error('No files found!')
    }
    baton.files = paths
  })
)

const initialize = baton => {
  const { config, plugins } = baton

  return Promise.all([
    launchChrome(config),
    startServer(config),
    createRunnerServer(config)
  ])
  .then(([ chrome, server, runner ]) => (
    createDriver(config).then(driver => {
      const hooks = {
        trace: plugHook(plugins, 'trace'),
        report: plugHook(plugins, 'report')
      }

      const tracer = createTracer(runner, driver, hooks, config)
      tracer.on('file:start', plugEvent(plugins, 'onFileStart'))
      tracer.on('file:finish', plugEvent(plugins, 'onFileFinish'))
      tracer.on('race:start', plugEvent(plugins, 'onRaceStart'))
      tracer.on('race:finish', plugEvent(plugins, 'onRaceFinish'))
      tracer.on('status', plugEvent(plugins, 'onStatus'))
      tracer.on('warn', plugEvent(plugins, 'onWarn'))

      baton.modules = { chrome, server, runner, driver }
      baton.tracer = tracer
    })
  ))
}

const runFiles = ({ files, tracer, plugins }) => (
  waterfall([
    plugEvent(plugins, 'onStart'),
    mapSeries(files, file => tracer.trace(file)),
    plugEvent(plugins, 'onFinish')
  ], files)
)

const error = (err, baton) => {
  cleanup(baton)
  throw err
}

const speedracer = (files, config) => {
  const defaultConfig = {
    files: 'perf/**/*.js',
    port: 3000,
    timeout: 3000,
    traces: true,
    reports: true,
    runnerPort: 3001,
    headless: true,
    reporters: [],
    plugins: []
  }

  const initialState = {
    files,
    config: defaults({}, config, defaultConfig),
    modules: {},
    tracer: null,
    reporters: config.reporters,
    plugins: config.plugins
  }

  return pipe(initialState, [
    load,
    initialize,
    runFiles,
    cleanup
  ], error)
}

module.exports = speedracer
