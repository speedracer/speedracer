const { assign } = require('lodash')

module.exports = class Trace {
  constructor(events) {
    assign(this, events)
  }
}
