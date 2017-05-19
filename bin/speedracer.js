#!/usr/bin/env node
const { join } = require('path')
const chalk = require('chalk')
const defaults = require('object-defaults')
const meow = require('meow')
const rollup = require('rollup')
const updateNotifier = require('update-notifier')
const waterfall = require('p-waterfall')

const { arrify, union } = require('../lib/.internal/util')
const display = require('../lib/display')
const speedracer = require('../')
const pkg = require('../package.json')

const checkForUpdate = () => {
  const notifier = updateNotifier({ pkg, updateCheckInterval: 0 })
  const { update } = notifier

  if (update) {
    /* eslint-disable */
    let message = `Update available! ${chalk.red(update.current)} → ${chalk.green(update.latest)}\n`
    message += `Run ${chalk.magenta('npm i -g speedracer')} to update!\n`
    message += `${chalk.magenta('Changelog:')} https://github.com/ngryman/speedracer/releases/tag/${update.latest}`
    /* eslint-enable */

    notifier.notify({ message })
  }
}

const parseArgs = () => {
  const commands = [
    'run',
    'display'
  ]
  const defaultCommand = 'run'

  const argv = meow({
    description: false,
    help: `
    ${display.logo()}

    ${chalk.red('speedracer [command] --help')}

    ${display.section('Commands:')}

      run        Run files  ${display.subtle('default')}
      display    Display reports
    `
  }, {
    alias: {
      help: 'h'
    }
  })

  // set default command if no command is found
  if (commands.findIndex(c => c === argv.input[0]) === -1) {
    argv.input.unshift(defaultCommand)
  }

  return argv
}

const loadConfig = (argv) => {
  const config = join(__dirname, `./speedracer.config.${argv.input[0]}.js`)

  return rollup.rollup({
    entry: config,
    onwarn: () => {}
  })
  .then(bundle => {
    const { code } = bundle.generate({ format: 'cjs' })

    const defaultLoader = require.extensions[ '.js' ]
    require.extensions['.js'] = (m, filename) => {
      if (filename === config) {
        m._compile(code, filename)
        require.extensions['.js'] = defaultLoader
      }
      else {
        defaultLoader(m, filename)
      }
    }

    const options = require(config)
    options.files = arrify(options.files)

    return {
      files: union(argv.input.slice(1), options.files),
      options: defaults({}, options, argv.flags)
    }
  })
}

const run = ({ files, options }) =>
speedracer(files, options)

waterfall([
  checkForUpdate,
  parseArgs,
  loadConfig,
  run
])
