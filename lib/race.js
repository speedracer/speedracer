const mkdirp = require('mkdirp')
const path = require('path')
const pify = require('pify')

const { writeFile } = require('./.internal/util')
const Report = require('./report')
const Trace = require('./trace')

class Race {
  constructor(file, infos) {
    this.metadata = {
      title: infos.title,
      group: file.replace(/[\/\\ -]/g, '-').slice(0, -3),
      id: infos.title.replace(/\s+/g, '-')
    }
    this.file = file
    this.trace = null
    this.report = null
  }

  get title() {
    return this.metadata.title
  }

  attachEvents(events) {
    this.trace = new Trace(events)
  }

  saveTrace(output) {
    const dirname = path.join(output, this.metadata.group)
    const filename = path.join(dirname, `${this.metadata.id}.trace.gz`)

    return this.trace.serialize()
      .then(buf => pify(mkdirp)(dirname)
      .then(() => writeFile(filename, buf))
    )
  }

  createReport() {
    this.report = new Report(this.metadata, this.trace)
  }

  saveReport(output) {
    const dirname = path.join(output, this.metadata.group)
    const filename = path.join(dirname, `${this.metadata.id}.speedracer`)

    return pify(mkdirp)(dirname)
      .then(() => writeFile(filename, this.report.serialize())
    )
  }
}

module.exports = Race
