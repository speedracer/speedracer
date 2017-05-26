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

  onTrace({ file, race, trace }) {
    const dirname = path.join(this.options.dest, this.metadata.group)
    const filename = path.join(dirname, `${this.metadata.id}.trace.gz`)

    return gzip(JSON.stringify(trace, null, 2))
      .then(buf => pify(mkdirp)(dirname).then(() => writeFile(filename, buf)))
  }

  onReport({ file, race, report }) {
    return race.saveReport(this.options.dest)
  }
}

module.exports = options => (
  new SavePlugin(defaults(options, defaultOptions))
)
