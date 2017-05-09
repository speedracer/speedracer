// Ours
const { sortEvents, cleanEvents } = require('./.internal/trace')
const { gzip, gunzip, readFile } = require('./.internal/util')

class Trace {
  constructor(events) {
    this.events = sortEvents(cleanEvents(events))
  }

  serialize() {
    return gzip(JSON.stringify(this.events, null, 2))
  }
}

const loadTrace = file =>
readFile(file)
  .then(gunzip)
  .then(JSON.parse)
  .then(events => new Trace(events))

module.exports = Trace
module.epoxrts.loadTrace = loadTrace
