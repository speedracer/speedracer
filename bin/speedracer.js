#!/usr/bin/env node

// Native
const path = require('path')

// Packages
const chalk = require('chalk')
const loudRejection = require('loud-rejection')
const Listr = require('listr')
const minimist = require('minimist')
const mkdirp = require('mkdirp')
const updateNotifier = require('update-notifier')

// Ours
const { logo, emphasis, subtle } = require('../lib/output')
const createReport = require('../lib/create-report')
const displayReport = require('../lib/display-report')
const launchChrome = require('../lib/launch-chrome')
const pkg = require('../package.json')
const saveReport = require('../lib/save-report')
const saveTrace = require('../lib/save-trace')
const startServer = require('../lib/start-server')
const traceFile = require('../lib/trace-file')

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
    output: 'o'
  },
  default: {
    output: path.join(process.cwd(), '.speedracer')
  }
})

/* eslint-disable */
const help = () => console.log(`
  ${logo()}

  ${chalk.red(`speedracer ${chalk.underline('files')} [options]`)}

  ${chalk.dim('Options:')}

    -h, --help            Usage information  ${subtle('false')}
    -t, --traces          Save traces        ${subtle(`${argv.t}`)}
    -r, --reports         Save reports       ${subtle(`${argv.r}`)}
    -o ${emphasis('dir')}, --output=${emphasis('dir')}  Output directory   ${subtle('./.speedracer')}

  ${chalk.dim('Examples:')}

  ${chalk.gray('–')} Race files in ${chalk.underline('perf')} directory:

    ${chalk.cyan('$ speedracer')}

  ${chalk.gray('–')} Race files matching ${chalk.underline('perf/**/*.js')} glob:

    ${chalk.cyan(`$ speedracer ${chalk.cyan('perf/**/*.js')}`)}

  ${chalk.gray('–')} Save traces and reports:

    ${chalk.cyan('$ speedracer --reports --traces --output=./speedracer')}
`)
/* eslint-enable */

if (argv.help) {
  help()
  process.exit(0)
}

console.log(`
  ${logo()}
`)

const setContext = (ctx, key, subkey) => val => {
  if (subkey) {
    ctx[key] = ctx[key] || {}
    ctx[key][subkey] = val
  }
  else {
    ctx[key] = val
  }
  return val
}

const start = () => {
  const tasks = [
    {
      title: 'Launching headless browser',
      task: ctx => launchChrome()
        .then(setContext(ctx, 'chrome'))
    },
    {
      title: 'Starting tracing server',
      task: ctx => startServer(process.cwd())
        .then(setContext(ctx, 'server'))
    }
  ]

  return new Listr(tasks)
}

const traceFiles = ({ files, options }) => {
  const tasks = files.map(file => ({
    title: file,
    task: (ctx, task) => traceFile(task, file, options)
      .then(setContext(ctx, 'traces', file))
      .then(events => {
        if (!options.traces) return
        const filename = path.join(options.output, `${path.basename(file, '.js')}.trace`)
        return saveTrace(filename, events)
      })
  }))

  return new Listr(tasks)
}

const analyzeFiles = ({ files, options }) => {
  const tasks = files.map(file => ({
    title: file,
    task: ctx => createReport(file, ctx.traces[file], options)
      .then(setContext(ctx, 'reports', file))
      .then(report => {
        if (!options.reports) return
        const filename = path.join(options.output, `${path.basename(file, '.js')}.speedracer`)
        return saveReport(filename, report)
      })
  }))

  return new Listr(tasks)
}

const displayReports = (ctx) => {
  Object.keys(ctx.reports).forEach(file => displayReport(ctx.reports[file]))
  return ctx
}

const cleanup = ctx => {
  if (ctx.chrome) {
    ctx.chrome.kill()
  }
  if (ctx.server) {
    ctx.server.close()
  }
}

const run = (files, options) => {
  if (files.length === 0) {
    console.error(chalk.red('No files to trace found!\n'))
    process.exit(1)
  }

  if (options.traces || options.reports) {
    mkdirp.sync(options.output)
  }

  const tasks = [
    {
      title: 'Starting',
      task: start
    },
    {
      title: 'Tracing',
      task: traceFiles
    },
    {
      title: 'Reporting',
      task: analyzeFiles
    }
  ]

  const runner = new Listr(tasks)
  runner.run({ files, options })
    .then(displayReports)
    .then(cleanup)
    .then(() => console.log(''))
}

run(argv._, argv)
