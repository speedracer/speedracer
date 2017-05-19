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
  const { reporters, plugins, config } = baton

  return Promise.all([
    launchChrome(config),
    startServer(config),
    createRunnerServer(config)
  ])
  .then(([ chrome, server, runner ]) => (
    createDriver(config).then(driver => {
      baton.modules = { chrome, server, runner, driver }
      baton.tracer = createTracer({ runner, driver, reporters, plugins, config })
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
