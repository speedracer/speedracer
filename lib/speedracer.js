const defaults = require('object-defaults')
const globby = require('globby')
const mapSeries = require('p-map-series')

const { eachProp, pipe } = require('./.internal/util')
const FileServer = require('./modules/file-server')
const Plugins = require('./plugins')
const Racer = require('./modules/racer')

const load = state => (
  globby(state.files).then(files => {
    if (files.length === 0) {
      throw new Error('No files found!')
    }
    state.files = files
  })
)

const start = ({ files, options, modules, plugins }) => (
  Promise.all([
    Racer(options, plugins),
    FileServer(options, plugins)
  ])
  .then(([ racer, server ]) => {
    modules.racer = racer
    modules.server = server
  })
  .then(() => plugins.onStart({ files }))
)

const run = ({ files, modules: { racer }, plugins }) => (
  mapSeries(files, file => racer.trace(file))
)

const finish = ({ plugins }) => (
  plugins.onFinish()
)

const cleanup = ({ modules }) => {
  eachProp(modules, module => module.dispose())
}

const speedracer = options => {
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
    modules: [],
    plugins: Plugins(options.plugins)
  }

  return pipe(state, [
    load,
    start,
    run,
    finish,
    cleanup
  ], (err, state) => {
    cleanup(state)
    throw err
  })
}

module.exports = speedracer
