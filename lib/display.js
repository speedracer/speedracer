// Packages
const ansi = require('ansi-escapes')
const chalk = require('chalk')
const ms = require('ms')
const stringWidth = require('string-width')
const truncate = require('cli-truncate')

// Ours
const version = require('../package.json').version

const columns = process.stdout.columns

const logo = () =>
`${chalk.bold('🏎   Speed Racer')} ${chalk.grey(`v${version}`)}`

const format = (n, unit) =>
  unit === 'ms' ? ms(Number(n.toFixed(0))) :
  unit === '%' ? Number(n.toFixed(2)) + '%' :
  typeof 'number' === n ? Number(n.toFixed(0)) : n

const value = (n, unit) =>
chalk.blue(format(n, unit))

const emphasis = chalk.bold.underline

const section = chalk.dim

const subtle = chalk.grey

const success = chalk.green

const failure = chalk.red

const flex = items => {
  const itemWidth = Math.floor((columns - 4) / items.length)
  return (
    '  ' +
    items.map((item, i) => {
      return (
        truncate(item, itemWidth - 2) +
        ' '.repeat(Math.max(0, itemWidth - stringWidth(item)))
      )
    }).join('') +
    '\n'
  )
}

const showCursor = () =>
process.stdout.write(ansi.cursorShow)

const hideCursor = () =>
process.stdout.write(ansi.cursorHide)

const eraseLines = count =>
process.stdout.write(ansi.eraseLines(count))

module.exports = {
  logo,
  value,
  emphasis,
  section,
  subtle,
  success,
  failure,
  flex,
  showCursor,
  hideCursor,
  eraseLines
}
