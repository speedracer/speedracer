const defaults = require('object-defaults')
const globby = require('globby')
const mapSeries = require('p-map-series')
const path = require('path')

const { eachProp, pipe } = require('./lib/.internal/util')
const createDriver = require('./lib/driver')
const createRunnerServer = require('./lib/runner-server')
const createTracer = require('./lib/tracer')
const launchChrome = require('./lib/chrome-launcher')
const startServer = require('./lib/server')

const pluginEvent = (plugins, event) => (...args) => (
  Promise.all(plugins.map(plugin => {
    const fn = plugin[event]
    if (fn) fn.apply(plugin, args)
  }))
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
  const { config } = baton

  return Promise.all([
    launchChrome(config),
    startServer(config),
    createRunnerServer(config)
  ])
  .then(([ chrome, server, runner ]) => (
    createDriver(config).then(driver => {
      const { plugins } = baton
      const tracer = createTracer(runner, driver, config)

      tracer.on('file:start', pluginEvent(plugins, 'onFileStart'))
      tracer.on('file:finish', pluginEvent(plugins, 'onFileFinish'))
      tracer.on('race:start', pluginEvent(plugins, 'onRaceStart'))
      tracer.on('race:finish', pluginEvent(plugins, 'onRaceFinish'))
      tracer.on('status', pluginEvent(plugins, 'onStatus'))
      tracer.on('warn', pluginEvent(plugins, 'onWarn'))

      baton.modules = { chrome, server, runner, driver }
      baton.tracer = tracer
    })
  ))
}

const runFiles = ({ files, tracer }) => (
  mapSeries(files, file => tracer.trace(file))
)

const error = (err, baton) => {
  cleanup(baton)
  throw err
}

const speedracer = (files, config) => {
  const defaultConfig = {
    files: 'perf/**/*.js',
    dest: path.join(process.cwd(), '.speedracer'),
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
