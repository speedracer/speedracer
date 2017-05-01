// Packages
const chalk = require('chalk')
const ms = require('ms')
const stringWidth = require('string-width')

// Ours
const { emphasis } = require('./output')

const cBlock = '\u2588'
const cLine = '\u2504'
const indent = '  '
const columns = process.stdout.columns
const padded = columns - indent.length * 2

const displayCategories = categories => {
  const catColors = {
    scripting: 'yellow',
    rendering: 'magenta',
    painting: 'green',
    loading: 'blue'
  }

  // Sum all the timings
  let total = 0
  Object.keys(categories).forEach(cat => {
    total += categories[cat]
  })

  console.log(chalk.dim(`${indent}Repartition\n`))

  // Display a rep bar
  process.stdout.write(indent)
  Object.keys(categories).forEach(cat => {
    const blocks = Math.round(categories[cat] / total * padded)
    process.stdout.write(chalk[catColors[cat]](cBlock.repeat(blocks)))
  })
  process.stdout.write('\n\n')

  // Display numbers
  process.stdout.write(indent)
  Object.keys(categories).forEach(cat => {
    const duration = chalk.blue(ms(Number(categories[cat].toFixed(0))))
    const block = chalk[catColors[cat]](cBlock)
    const output = `${block} ${cat}: ${duration}`
    const fill = ' '.repeat(padded / 4 - stringWidth(output))
    process.stdout.write(output + fill)
  })
  process.stdout.write('\n\n')
}

const displayFunctions = functions => {
  const userFuncSignature = /f:(\w+)@/

  console.log(chalk.dim(`${indent}Functions\n`))

  Object.keys(functions).forEach(func => {
    const match = func.match(userFuncSignature)
    if (!match) return

    const fnName = match[1]
    const duration = chalk.blue(ms(Number(functions[func].toFixed(0))))
    console.log(`${indent}${fnName}: ${duration}`)
  })
}

const displayReport = report => {
  console.log(`\n${chalk.grey(cLine.repeat(columns))}`)
  console.log(`\n${emphasis(report.name)}\n`)

  displayCategories(report.profiling.categories)
  displayFunctions(report.profiling.functions)
}

module.exports = displayReport
