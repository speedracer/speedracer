#!/usr/bin/env node

// Native
const path = require('path')

// Packages
const chalk = require('chalk')
const eachSeries = require('p-each-series')
const loudRejection = require('loud-rejection')
const minimist = require('minimist')
const mkdirp = require('mkdirp')
const series = require('p-series')
const updateNotifier = require('update-notifier')

// Ours
const createDriver = require('../lib/driver')
const createRunnerServer = require('../lib/runner-server')
const display = require('../lib/display')
const launchChrome = require('../lib/chrome-launcher')
const pkg = require('../package.json')
const startServer = require('../lib/server')
const traceFile = require('../lib/trace-file')
const { forEachProp, pipe } = require('../lib/.internal/util')

loudRejection()

if (!process.pkg) {
  const notifier = updateNotifier({ pkg })
  const { update } = notifier

  if (update) {
    /* eslint-disable */
    let message = `Update available! ${chalk.red(update.current)} → ${chalk.green(update.latest)} \n`;
    message += `Run ${chalk.magenta('npm i -g now')} to update!\n`
    message += `${chalk.magenta('Changelog:')} https://github.com/ngryman/speedracer/releases/tag/${update.latest}`
    /* eslint-enable */

    notifier.notify({ message })
  }
}

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

  ${display.section('Options')}

    -h, --help            Usage information    ${display.subtle('false')}
    -t, --traces          Save traces          ${display.subtle(argv.t)}
    -r, --reports         Save reports         ${display.subtle(argv.r)}
    -o ${display.emphasis('dir')}, --output=${display.emphasis('dir')}  Output directory     ${display.subtle('.speedracer')}
    -p, --port            Tracing server port  ${display.subtle(argv.p)}
    --runner-port         Runner server port   ${display.subtle(argv.rp)}
    --timeout             Run timeout         ${display.subtle(argv.timeout)}

  ${display.section('Examples')}

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

const header = () => {
  console.log(`
    ${display.logo()}
  `)
}

const footer = () => {
  console.log('')
}

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
  })
]).then(modules => {
  baton.modules = {
    chrome: modules[0],
    server: modules[1],
    runner: modules[2],
    driver: modules[3]
  }
})

const runFiles = ({ files, options, modules }) =>
eachSeries(files, file =>
  traceFile(file, modules.runner, modules.driver)
    .then(runs => {
      if (options.traces) {
        runs.forEach(run => run.saveTrace(options.output))
      }
    })
)

const cleanup = ({ modules }) =>
forEachProp(modules, m => { if (m) m.close() })

const error = (err, baton) => {
  console.error(chalk.red(err.message))
  cleanup(baton)
  footer()
  process.exit(1)
}

const run = (files, options) =>
pipe({ files, options, modules: {}}, [
  header,
  prepare,
  initialize,
  runFiles,
  cleanup,
  footer
], error)

run(argv._, argv)
