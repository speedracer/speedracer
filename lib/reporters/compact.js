// Native
const { EOL } = require('os')

// Packages
const chalk = require('chalk')
const indent = require('indent-string')
const spinners = require('cli-spinners')
const truncate = require('cli-truncate')

// Ours
const { value, subtle, success, failure, flex, eraseLines } = require('../display')

const { stdout } = process
const { columns } = stdout

const newLineRegex = new RegExp(EOL, 'g')

const successSprite = { frames: ['✔'] }

class SubtleReporter {
  constructor() {
    this.spinner = {
      sprite: spinners.dots,
      style: subtle,
      frame: 0,
      intervalId: null
    }
    this.spinnerText = ''
    this.statusText = ''
    this.status = null
    this.warningsText = ''
    this.text = ''
    this.startTime = 0
    this.fileTime = 0
    this.fastest = { time: Infinity, title: 'n/a' }
    this.slowest = { time: 0, title: 'n/a' }

    this.run = null
    this.file = ''
  }

  start(files) {
    this.spinner.intervalId = setInterval(() => this.update(), this.spinner.sprite.interval)
  }

  startFile(file) {
    this.spinnerText = truncate(file, columns - 8)
    this.file = file
    this.fileTime = Date.now()
  }

  startRun(run) {
    this.spinnerText = truncate(`${chalk.yellow(run.title)}  ${this.file}`, columns - 8)
    this.startTime = Date.now()
    this.run = run
  }

  finishRun(run) {
    const elapsed = Date.now() - this.startTime
    if (elapsed < this.fastest.time) {
      this.fastest = { time: elapsed, title: run.title }
    }
    if (elapsed > this.slowest.time) {
      this.slowest = { time: elapsed, title: run.title }
    }
    this.updateStatus(this.status)
    this.update()
  }

  finishFile(file) {
    this.spinnerText = ''
    this.file = ''
  }

  finish(runs) {
    clearInterval(this.spinner.intervalId)

    this.spinner.style = success
    this.spinner.sprite = successSprite

    this.spinnerText = success(`${runs.length} runs`)

    this.statusText = ''
    this.statusText += `  🏁   fastest  ${value(this.fastest.title)}\n`
    this.statusText += `      slowest  ${value(this.slowest.title)}`

    this.update()
  }

  updateStatus(status) {
    this.statusText = ''
    this.statusText += flex([
      `🕓   current time  ${value(Date.now() - this.startTime, 'ms')}`,
      `🔩   buffer usage      ${value(status.bufferUsage * 100, '%')}`
    ])
    this.statusText += flex([
      `    total time    ${value(Date.now() - this.fileTime, 'ms')}`,
      `    events collected  ${value(status.collectedEvents)}`
    ])

    this.status = status
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

module.exports = SubtleReporter
