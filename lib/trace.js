// Ours
const { sortEvents, cleanEvents } = require('./.internal/trace')
const { gzip } = require('./.internal/util')

class Trace {
  constructor(events) {
    this.events = sortEvents(cleanEvents(events))
  }

  serialize() {
    return gzip(JSON.stringify(this.events, null, 2))
  }
}

module.exports = Trace
