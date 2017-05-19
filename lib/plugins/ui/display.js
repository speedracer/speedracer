// Packages
const chalk = require('chalk')
const stringWidth = require('string-width')

// Ours
const display = require('./display')
const { eachProp } = require('./.internal/util')

const cBlock = '\u2588'
const cLine = '\u2504'
const indent = '  '
const columns = process.stdout.columns
const padded = columns - indent.length * 2

const showCategories = categories => {
  const catColors = {
    scripting: chalk.yellow,
    rendering: chalk.magenta,
    painting: chalk.green
  }

  // Sum all the timings
  let totalTime = 0
  eachProp(categories, time => { totalTime += time })

  console.log(`${indent}${display.section('Repartition')}\n`)

  // Display a rep bar
  process.stdout.write(indent)
  eachProp(categories, (time, cat) => {
    const blocks = Math.round(time / totalTime * padded)
    process.stdout.write(catColors[cat](cBlock.repeat(blocks)))
  })
  process.stdout.write('\n\n')

  // Display legend
  process.stdout.write(indent)
  eachProp(categories, (time, cat) => {
    const duration = display.value(time, 'ms')
    const block = catColors[cat](cBlock)
    const output = `${block} ${cat} ${duration}`
    const fill = ' '.repeat(padded / 3 - stringWidth(output))
    process.stdout.write(output + fill)
  })
  process.stdout.write('\n\n')
}

const showFunctions = functions => {
  const userFnSignature = /f:(\w+)@/

  console.log(`${indent}${display.section('Functions')}\n`)

  eachProp(functions, (time, fnName) => {
    // exclude functions at 0ms
    if (time < 1) return

    // exclude all nonuser functions
    const match = fnName.match(userFnSignature)
    if (!match) return

    fnName = match[1]
    const duration = display.value(time, 'ms')
    console.log(`${indent}${fnName} ${duration}`)
  })
}

class DisplayUI {
  process({ file, race, report }) {
    console.log(`\n${display.subtle(cLine.repeat(columns))}`)
    console.log(`\n${display.emphasis(report.title)}\n`)

    showCategories(report.profiling.categories)
    showFunctions(report.profiling.functions)
  }
}

module.exports = () => (
  new DisplayUI()
)
