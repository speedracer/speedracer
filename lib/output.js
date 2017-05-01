// Packages
const chalk = require('chalk')

// Ours
const version = require('../package.json').version

const logo = () => `${chalk.bold('🚗  Speed Racer')} ${chalk.grey(`v${version}`)}`

const emphasis = text => chalk.bold.underline(text)

const subtle = text => chalk.grey(text)

module.exports = { logo, emphasis, subtle }
