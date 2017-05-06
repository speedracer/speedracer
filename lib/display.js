// Packages
const chalk = require('chalk')
const ms = require('ms')

// Ours
const version = require('../package.json').version

const logo = () =>
`${chalk.bold('🏎  Speed Racer')} ${chalk.grey(`v${version}`)}`

const digit = n =>
chalk.blue(ms(Number(n.toFixed(0))))

const emphasis = text =>
chalk.bold.underline(text)

const section = text =>
chalk.dim(`${text}:`)

const subtle = text =>
chalk.grey(text)

module.exports = { logo, digit, emphasis, section, subtle }
