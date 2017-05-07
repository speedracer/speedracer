#!/usr/bin/env node

// Native
const path = require('path')

// Packages
const chalk = require('chalk')
const mapSeries = require('p-map-series')
const loudRejection = require('loud-rejection')
const minimist = require('minimist')
const mkdirp = require('mkdirp')
const series = require('p-series')
const waterfall = require('p-waterfall')

// Ours
const checkForUpdate = require('../lib/check-for-update')
const createDriver = require('../lib/driver')
const createReporter = require('../lib/reporter')
const createRunnerServer = require('../lib/runner-server')
const display = require('../lib/display')
const launchChrome = require('../lib/chrome-launcher')
const startServer = require('../lib/server')
const traceFile = require('../lib/trace-file')
const { flat, forEachProp, pipe } = require('../lib/.internal/util')

const DEBUG = process.env.DEBUG

loudRejection()
checkForUpdate()

const argv = minimist(process.argv.slice(2), {
  string: ['output'],
  boolean: ['help', 'traces', 'reports'],
  alias: {
    help: 'h',
    traces: 't',
    reports: 'r',
    output: 'o',
    port: 'p'
  },
  default: {
    'output': path.join(process.cwd(), '.speedracer'),
    'port': 3000,
    'runner-port': 3001,
    'timeout': 5000
  }
})

/* eslint-disable */
const help = () => console.log(`
  ${display.logo()}

  ${chalk.red(`speedracer ${chalk.underline('files')} [options]`)}

  ${display.section('Options:')}

    -h, --help            Usage information    ${display.subtle('false')}
    -t, --traces          Save traces          ${display.subtle(argv.t)}
    -r, --reports         Save reports         ${display.subtle(argv.r)}
    -o ${display.emphasis('dir')}, --output=${display.emphasis('dir')}  Output directory     ${display.subtle('.speedracer')}
    -p, --port            Tracing server port  ${display.subtle(argv.p)}
    --runner-port         Runner server port   ${display.subtle(argv.rp)}
    --timeout             Run timeout          ${display.subtle(argv.timeout)}

  ${display.section('Examples:')}

  ${display.subtle('–')} Race files in ${chalk.underline('perf')} directory:

    ${chalk.cyan('$ speedracer')}

  ${display.subtle('–')} Race files matching ${chalk.underline('perf/**/*.js')} glob:

    ${chalk.cyan(`$ speedracer ${chalk.cyan('perf/**/*.js')}`)}

  ${display.subtle('–')} Save traces and reports:

    ${chalk.cyan('$ speedracer --reports --traces --output=./speedracer')}
`)
/* eslint-enable */

if (argv.help) {
  help()
  process.exit(0)
}

const header = () => console.log('')

const footer = () => console.log('\n')

const cleanup = ({ modules }) =>
forEachProp(modules, m => { if (m && m.close) m.close() })

const prepare = ({ files, options }) => {
  if (files.length === 0) {
    throw new Error('No files to trace found!')
  }

  if (options.traces || options.reports) {
    mkdirp.sync(options.output)
  }
}

// TODO: check what happens if one fails, how can we cleanup the others?
const initialize = baton =>
series([
  () => launchChrome(),
  () => startServer({
    baseDir: process.cwd(),
    port: baton.options.port,
    clientPort: baton.options['runner-port']
  }),
  () => createRunnerServer({
    port: baton.options['runner-port']
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
    traceFile(file, modules)
      .then(runs => mapSeries(runs, run => {
        if (options.traces) {
          run.saveTrace(options.output)
        }

        run.createReport()
        if (options.reports) {
          run.saveReport(options.output)
        }

        return run
      }))
  ),
  runs => modules.reporter.finish(flat(runs))
])

const error = (err, baton) => {
  console.error(chalk.red(err.message))
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

run(argv._, argv)
