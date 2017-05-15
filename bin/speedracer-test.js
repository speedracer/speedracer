#!/usr/bin/env node

// Native
const path = require('path')

// Packages
const chalk = require('chalk')
const globby = require('globby')
const mapSeries = require('p-map-series')
const meow = require('meow')
const series = require('p-series')
const waterfall = require('p-waterfall')

// Ours
const createDirector = require('../lib/director')
const createDriver = require('../lib/driver')
const createReporter = require('../lib/reporter')
const createRunnerServer = require('../lib/runner-server')
const display = require('../lib/display')
const launchChrome = require('../lib/chrome-launcher')
const startServer = require('../lib/server')
const { flat, forEachProp, pipe, writeFile, createDir } = require('../lib/.internal/util')

const DEBUG = process.env.DEBUG

const defaultFlags = {
  snapshotsDirname: 'snapshots',
  updateSnapshots: false,
  timeout: 3000,
  port: 3000,
  runnerPort: 3001,
  headless: true
}

/* eslint-disable */
const argv = meow({
  description: false,
  help: `
    ${display.logo()}

    ${chalk.red(`speedracer test ${chalk.underline('files')} [options]`)}

    ${display.section('Options:')}

      --snapshots-dirname=${display.emphasis('dirname')}, -s ${display.emphasis('dirname')}    Snapshots directory name  ${display.subtle(defaultFlags.snapshotsDirname)}
      --update-snapshots, -u                     Update snapshots          ${display.subtle(defaultFlags.updateSnapshots)}
      --timeout, -t                              Run timeout               ${display.subtle(defaultFlags.timeout)}
      --port, -p                                 Tracing server port       ${display.subtle(defaultFlags.port)}
      --runner-port                              Runner server port        ${display.subtle(defaultFlags.runnerPort)}
      --chrome-flags                             Additional Chrome flags
      --no-headless                              Run Chrome visually

    ${display.section('Examples:')}

    ${display.subtle('–')} Test files recursively in ${chalk.underline('perf')} directory:

      ${chalk.cyan('$ speedracer test')}

    ${display.subtle('–')} Save snapshots to a directory named ${chalk.underline('__snapshots__')}:

      ${chalk.cyan(`$ speedracer perf/*.js --snapshots-dirname=__snapshots__`)}
  `
}, {
  string: ['snapshotsDirname', 'chromeFlags'],
  boolean: ['help', 'updateSnapshots', 'headless'],
  alias: {
    help: 'h',
    updateSnapshots: 'u',
    timeout: 't',
    port: 'p'
  },
  default: defaultFlags
})
/* eslint-enable */

const header = () => console.log('')

const footer = () => console.log('\n')

const cleanup = ({ modules }) =>
forEachProp(modules, m => { if (m && m.close) m.close() })

const prepare = baton => {
  // set default directory to perf
  if (baton.files.length === 0) {
    baton.files = ['perf/**/*.js']
  }

  // match glob pattern
  return globby(baton.files).then(paths => {
    if (paths.length === 0) {
      throw new Error('No files found!')
    }
    baton.files = paths
  })
}

// TODO: check what happens if one fails, how can we cleanup the others?
const initialize = baton =>
series([
  () => launchChrome({
    flags: baton.options.chromeFlags,
    headless: baton.options.headless
  }),
  () => startServer({
    baseDir: process.cwd(),
    port: baton.options.port,
    clientPort: baton.options.runnerPort
  }),
  () => createRunnerServer({
    port: baton.options.runnerPort
  }),
  () => createDriver({
    port: baton.options.port
  }),
  () => createReporter(DEBUG ? 'noop' : 'compact')
]).then(modules => {
  baton.modules = {
    chrome: modules[0],
    server: modules[1],
    runner: modules[2],
    driver: modules[3],
    reporter: modules[4]
  }

  baton.modules.director = createDirector(baton.modules, baton.options)

  /* istanbul ignore next */
  process.on('SIGINT', () => {
    cleanup(baton)
    display.showCursor()
    process.stdout.write('\n')
    process.exit()
  })
})

const runFiles = ({ files, options, modules }) =>
waterfall([
  () => modules.reporter.start(files),
  () => mapSeries(files, file =>
    modules.director.runFile(file)
      .then(races => mapSeries(races, race => {
        race.createReport()

        const dirname = path.join(path.dirname(file), options.snapshotsDirname)
        const filename = path.join(dirname, `${race.report.metadata.id}.speedracer`)

        // make sure the snapshot directory exist
        return createDir(dirname)
        .then(() => writeFile(filename, race.report.serialize()))
      }))
  ),
  races => modules.reporter.finish(flat(races))
])

const error = (err, baton) => {
  console.error(chalk.red(err.message))
  /* istanbul ignore if */
  if (DEBUG) console.error(err.stack)
  cleanup(baton)
  footer()
  display.showCursor()
  process.exit(1)
}

const run = (files, options) =>
pipe({ files, options, modules: {}}, [
  display.hideCursor,
  header,
  prepare,
  initialize,
  runFiles,
  cleanup,
  footer,
  display.showCursor
], error)

run(argv.input.slice(1), argv.flags)
