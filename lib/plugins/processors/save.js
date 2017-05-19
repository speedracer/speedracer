const defaults = require('object-defaults')
const path = require('path')

const defaultOptions = {
  dest: path.join(process.cwd(), '.speedracer')
}

class SavePlugin {
  process({ file, race, events, report }) {
    return Promise.all([
      race.saveReport(this.options.dest),
      race.saveTrace(this.options.dest)
    ])
  }
}

module.exports = options => (
  new SavePlugin(defaults(options, defaultOptions))
)
