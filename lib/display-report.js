// Packages
const chalk = require('chalk')
const stringWidth = require('string-width')

// Ours
const display = require('./display')
const { forEachProp } = require('./.internal/util')

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
  let totalTime = 0
  forEachProp(categories, time => { totalTime += time })

  console.log(`${indent}${display.section('Repartition')}\n`)

  // Display a rep bar
  process.stdout.write(indent)
  forEachProp(categories, (time, cat) => {
    const blocks = Math.round(time / totalTime * padded)
    process.stdout.write(chalk[catColors[cat]](cBlock.repeat(blocks)))
  })
  process.stdout.write('\n\n')

  // Display legend
  process.stdout.write(indent)
  forEachProp(categories, (time, cat) => {
    const duration = display.digit(time)
    const block = chalk[catColors[cat]](cBlock)
    const output = `${block} ${cat}: ${duration}`
    const fill = ' '.repeat(padded / 4 - stringWidth(output))
    process.stdout.write(output + fill)
  })
  process.stdout.write('\n\n')
}

const displayFunctions = functions => {
  const userFnSignature = /f:(\w+)@/

  console.log(`${indent}${display.section('Functions')}\n`)

  forEachProp(functions, (time, fnName) => {
    const match = fnName.match(userFnSignature)
    if (!match) return

    fnName = match[1]
    const duration = display.digit(time)
    console.log(`${indent}${fnName}: ${duration}`)
  })
}

const displayReport = report => {
  console.log(`\n${display.subtle(cLine.repeat(columns))}`)
  console.log(`\n${display.emphasis(report.name)}\n`)

  displayCategories(report.profiling.categories)
  displayFunctions(report.profiling.functions)
}

module.exports = displayReport
