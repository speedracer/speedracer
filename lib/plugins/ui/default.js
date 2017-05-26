const { EOL } = require('os')
const chalk = require('chalk')
const indent = require('indent-string')
const spinners = require('cli-spinners')
const truncate = require('cli-truncate')

const { value, subtle, success, failure, flex, eraseLines } = require('../../display')

const { stdout } = process
const { columns } = stdout
const DEBUG = process.env.DEBUG

const newLineRegex = new RegExp(EOL, 'g')

const successSprite = { frames: ['✔'] }

class DefaultUI {
  constructor() {
    this.spinner = {
      sprite: spinners.dots,
      style: subtle,
      frame: 0,
      intervalId: null
    }
    this.spinnerText = ''
    this.status = ''
    this.warnings = ''
    this.text = ''
    this.startTime = 0
    this.fileTime = 0
    this.fastest = { time: Infinity, title: 'n/a' }
    this.slowest = { time: 0, title: 'n/a' }

    this.race = null
    this.races = []
    this.totalRaces = 0
    this.file = ''
  }

  onStart({ files }) {
    this.spinner.intervalId = setInterval(() => this.update(), this.spinner.sprite.interval)
  }

  onFinish() {
    clearInterval(this.spinner.intervalId)

    this.spinner.style = success
    this.spinner.sprite = successSprite

    this.spinnerText = success(`${this.totalRaces} races`)

    this.status = ''
    this.status += `  🏁   fastest  ${value(this.fastest.title)}\n`
    this.status += `      slowest  ${value(this.slowest.title)}`

    this.update()
  }

  onFileStart({ file }) {
    this.spinnerText = truncate(file, columns - 8)
    this.file = file
    this.fileTime = Date.now()
  }

  onFileFinish({ file }) {
    this.spinnerText = ''
    this.races.length = 0
    this.file = ''
  }

  onRaceStart({ race }) {
    this.spinnerText = truncate(`${chalk.yellow(race.title)}  ${this.file}`, columns - 8)
    this.startTime = Date.now()
    this.race = race
  }

  onRaceFinish({ race }) {
    const elapsed = Date.now() - this.startTime
    if (elapsed < this.fastest.time) {
      this.fastest = { time: elapsed, title: race.title }
    }
    if (elapsed > this.slowest.time) {
      this.slowest = { time: elapsed, title: race.title }
    }
    this.races.push(race)
    this.totalRaces++
    this.update()
  }

  onStatus({ status }) {
    this.status = ''
    this.status += flex([
      `🕓   current time  ${value(Date.now() - this.startTime, 'ms')}`,
      `🔩   buffer usage      ${value(status.bufferUsage * 100, '%')}`
    ])
    this.status += flex([
      `    total time    ${value(Date.now() - this.fileTime, 'ms')}`,
      `    events collected  ${value(status.collectedEvents)}`
    ])
  }

  onWarn({ warning }) {
    if (this.warnings.length === 0) {
      this.warnings = indent(warning, 1)
    }
    else {
      this.warnings += indent(`\n${warning}`, 5)
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
    this.text += this.status
    this.text += this.warnings ? failure(`\n\n  ⚠ ${indent(this.warnings)}`) : ''
    stdout.write(this.text)
  }
}

module.exports = () => (
  !DEBUG ? new DefaultUI() : {}
)
