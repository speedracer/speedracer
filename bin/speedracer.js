#!/usr/bin/env node

// Packages
const chalk = require('chalk')

// Ours
const { last } = require('../lib/.internal/util')
const checkForUpdate = require('../lib/check-for-update')
const display = require('../lib/display')

checkForUpdate()

const commands = [
  'trace',
  'analyze'
]
const defaultCommand = 'trace'

const { argv } = process

const help = () => console.log(`
  ${display.logo()}

  ${chalk.red('speedracer [command] --help')}

  ${display.section('Commands:')}

    trace    ${display.subtle('default')}
    analyze

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
