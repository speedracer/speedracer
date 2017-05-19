// Native
const { EOL } = require('os')

// Packages
const chalk = require('chalk')
const indent = require('indent-string')
const spinners = require('cli-spinners')
const truncate = require('cli-truncate')

// Ours
const { createDir } = require('../.internal/util')
const { value, subtle, success, failure, flex, eraseLines } = require('../display')

const DEBUG = process.env.DEBUG

const { stdout } = process
const { columns } = stdout

const newLineRegex = new RegExp(EOL, 'g')

const successSprite = { frames: ['✔'] }

class SimpleReporter {
  constructor() {
    this.spinner = {
      sprite: spinners.dots,
      style: subtle,
      frame: 0,
      intervalId: null
    }
    this.spinnerText = ''
    this.statusText = ''
    this.warningsText = ''
    this.text = ''
    this.startTime = 0
    this.fileTime = 0
    this.fastest = { time: Infinity, title: 'n/a' }
    this.slowest = { time: 0, title: 'n/a' }

    this.race = null
    this.races = []
    this.file = ''
  }

  start(files, { output }) {
    if (!DEBUG) {
      this.spinner.intervalId = setInterval(() => this.update(), this.spinner.sprite.interval)
    }

    return createDir(output)
  }

  startFile(file) {
    if (!DEBUG) this.spinnerText = truncate(file, columns - 8)
    this.file = file
    this.fileTime = Date.now()
  }

  startRace(race) {
    if (!DEBUG) {
      this.spinnerText = truncate(`${chalk.yellow(race.title)}  ${this.file}`, columns - 8)
      this.startTime = Date.now()
    }
    this.race = race
  }

  finishRace(race) {
    const elapsed = Date.now() - this.startTime
    if (elapsed < this.fastest.time) {
      this.fastest = { time: elapsed, title: race.title }
    }
    if (elapsed > this.slowest.time) {
      this.slowest = { time: elapsed, title: race.title }
    }
    this.races.push(race)
    this.update()
  }

  finishFile(file, { traces, reports, output }) {
    if (!DEBUG) this.spinnerText = ''

    this.races.forEach(race => {
      race.createReport()
      return Promise.all([
        new Promise(() => {
          if (traces) {
            race.saveTrace(output)
          }
        }),
        new Promise(() => {
          if (reports) {
            race.saveReport(output)
          }
        })
      ])
    })

    this.races.length = 0
    this.file = ''
  }

  finish(races) {
    clearInterval(this.spinner.intervalId)

    if (DEBUG) return

    this.spinner.style = success
    this.spinner.sprite = successSprite

    this.spinnerText = success(`${races.length} races`)

    this.statusText = ''
    this.statusText += `  🏁   fastest  ${value(this.fastest.title)}\n`
    this.statusText += `      slowest  ${value(this.slowest.title)}`

    this.update()
  }

  status(statusText) {
    if (DEBUG) return

    this.statusText = ''
    this.statusText += flex([
      `🕓   current time  ${value(Date.now() - this.startTime, 'ms')}`,
      `🔩   buffer usage      ${value(statusText.bufferUsage * 100, '%')}`
    ])
    this.statusText += flex([
      `    total time    ${value(Date.now() - this.fileTime, 'ms')}`,
      `    events collected  ${value(statusText.collectedEvents)}`
    ])
  }

  warn(text) {
    if (this.warningsText.length === 0) {
      this.warningsText = indent(text, 1)
    }
    else {
      this.warningsText += indent(`\n${text}`, 5)
    }
  }

  linesCount() {
    return (this.text.match(newLineRegex) || '').length + 1
  }

  update() {
    if (DEBUG) return

    const { style, sprite, frame } = this.spinner
    const spriteFrame = style(sprite.frames[frame % sprite.frames.length])
    this.spinner.frame++

    eraseLines(this.linesCount())

    this.text = `  ${spriteFrame}   ${subtle(this.spinnerText)}\n\n`
    this.text += this.statusText
    this.text += this.warningsText ? failure(`\n\n  ⚠ ${indent(this.warningsText)}`) : ''
    stdout.write(this.text)
  }
}

module.exports = () => new SimpleReporter()
