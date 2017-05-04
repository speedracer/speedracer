// Native
const fs = require('fs')
const path = require('path')

// Packages
const pify = require('pify')

// Ours
const Trace = require('./trace')
const { writeFile } = require('./.internal/util')

class Run {
  constructor(file, infos) {
    this.file = file
    this.title = infos.title
    this.trace = null
    this.report = null
  }

  attachEvents(events) {
    this.trace = new Trace(events)
  }

  saveTrace(output) {
    const dirname = path.join(output, this.file.replace(/[\/\\ -]/g, '-').slice(0, -3))
    const basename = this.title.replace(/\s+/g, '-')
    const filename = path.join(dirname, `${basename}.trace.gz`)

    return this.trace.serialize()
      .then(buf => pify(fs.mkdir)(dirname).then(
        () => writeFile(filename, buf),
        () => writeFile(filename, buf)
      )
    )
  }
}

module.exports = Run
