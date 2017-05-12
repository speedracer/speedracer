// Native
const path = require('path')

// Packages
const mkdirp = require('mkdirp')
const pify = require('pify')

// Ours
const Report = require('./report')
const Trace = require('./trace')
const { writeFile } = require('./.internal/util')

class Race {
  constructor(file, infos) {
    this.meta = {
      title: infos.title,
      group: file.replace(/[\/\\ -]/g, '-').slice(0, -3),
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
    const dirname = path.join(output, this.meta.group)
    const filename = path.join(dirname, `${this.meta.id}.trace.gz`)

    return this.trace.serialize()
      .then(buf => pify(mkdirp)(dirname)
      .then(() => writeFile(filename, buf))
    )
  }

  createReport() {
    this.report = new Report(this.meta, this.trace)
  }

  saveReport(output) {
    const dirname = path.join(output, this.meta.group)
    const filename = path.join(dirname, `${this.meta.id}.speedracer`)

    return pify(mkdirp)(dirname)
      .then(() => writeFile(filename, this.report.serialize())
    )
  }
}

module.exports = Race
