const defaults = require('object-defaults')
const mkdirp = require('mkdirp')
const path = require('path')
const pify = require('pify')

const { gzip, writeFile } = require('../../.internal/util')

const defaultOptions = {
  dest: path.join(process.cwd(), '.speedracer')
}

class SavePlugin {
  constructor(options) {
    this.options = options
  }

  onStart() {
    return pify(mkdirp)(this.options.dest)
  }

  onTrace({ file, race, trace }) {
    const group = file.replace(/[\/\\ -]/g, '-').slice(0, -3)
    const title = race.title.replace(/\s+/g, '-')
    const filename = path.join(this.options.dest, `${group}--${title}.trace.gz`)

    return gzip(JSON.stringify(trace, null, 2))
      .then(buf => writeFile(filename, buf))
  }

  onReport({ file, race, report }) {
    return race.saveReport(this.options.dest)
  }
}

module.exports = options => (
  new SavePlugin(defaults(options, defaultOptions))
)
