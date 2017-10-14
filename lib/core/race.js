const hasha = require('hasha')

const Trace = require('./trace')

const REF_PREFIX = `__sr_${Date.now()}`

module.exports = class Race {
  constructor(name) {
    this.name = name
    this.id = hasha(name, { algorithm: 'md5' })
    this.ref = `${REF_PREFIX}_${this.id}`
    this.trace = null
  }

  attachEvents(events) {
    this.trace = new Trace(events)
  }
}
