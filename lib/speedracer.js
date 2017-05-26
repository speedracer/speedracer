const defaults = require('object-defaults')
const globby = require('globby')
const mapSeries = require('p-map-series')

const { pipe } = require('./.internal/util')
const createModule = require('./create-module')

const load = state => (
  globby(state.files).then(files => {
    if (files.length === 0) {
      throw new Error('No files found!')
    }
    state.files = files
  })
)

const start = ({ modules, options }) => (
  Promise.all([
    // createModule(modules.tracer, options),
    createModule(modules.server, options)
  ])
  .then(([ tracer, server ]) => {
    modules.tracer = tracer
    modules.server = server
  })
  // .then(state.plugins.onStart)
)

const run = ({ files, modules: { tracer }, plugins }) => (
  mapSeries(files, file => tracer.trace(file))
)

const finish = ({ plugins }) => (
  plugins.onFinish()
)

const cleanup = ({ modules }) => {
  modules.dispose()
}

const speedracer = (options, modules) => {
  const defaultOptions = {
    port: 3000,
    timeout: 3000,
    runnerPort: 3001,
    headless: true,
    plugins: []
  }

  const files = options.files || 'perf/**/*.js'
  delete options.files

  const state = {
    files,
    options: defaults({}, options, defaultOptions),
    modules,
    // plugins: Plugins(options.plugins)
  }

  return pipe(state, [
    load,
    start,
    run,
    // finish,
    // cleanup
  ], (err, state) => {
    console.log(err)
    // cleanup(state)
    throw err
  })
}

module.exports = speedracer
