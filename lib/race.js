// Native
const path = require('path')

// Ours
const Report = require('./report')
const Trace = require('./trace')
const { writeFile } = require('./.internal/util')

class Race {
  constructor(file, infos) {
    this.meta = {
      title: infos.title,
      group: file.replace(/\s+/g, '-').replace(/[\/\\]+/g, '--').slice(0, -3),
      id: infos.title.replace(/\s+/g, '-')
    }
    this.file = file
    this.trace = null
    this.report = null
  }

  get title() {
    return this.meta.title
  }

  attachEvents(events) {
    this.trace = new Trace(events)
  }

  saveTrace(output) {
    const filename = path.join(output, `${this.meta.group}--${this.meta.id}.trace.gz`)
    return this.trace.serialize()
      .then(buf => writeFile(filename, buf))
  }

  createReport() {
    this.report = new Report(this.meta, this.trace)
  }

  saveReport(output) {
    const filename = path.join(output, `${this.meta.group}--${this.meta.id}.speedracer`)
    return writeFile(filename, this.report.serialize())
  }
}

module.exports = Race
