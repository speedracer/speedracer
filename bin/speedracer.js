#!/usr/bin/env node

// Packages
const chalk = require('chalk')

// Ours
const { last } = require('../lib/.internal/util')
const checkForUpdate = require('../lib/check-for-update')
const display = require('../lib/display')

checkForUpdate()

const commands = [
  'run',
  'display'
]
const defaultCommand = 'run'

const { argv } = process

const help = () => console.log(`
  ${display.logo()}

  ${chalk.red('speedracer [command] --help')}

  ${display.section('Commands:')}

    run        Run files  ${display.subtle('default')}
    display    Display reports

`)

// display generic help
if (argv.length === 3 && (last(argv) === '-h' || last(argv) === '--help')) {
  help()
  process.exit(0)
}

// set default command if no command is found
if (commands.findIndex(c => c === argv[2]) === -1) {
  argv.splice(2, 0, defaultCommand)
}

require(`./speedracer-${argv[2]}`)
