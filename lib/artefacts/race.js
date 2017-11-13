import hasha from 'hasha'

import Trace from './trace'

const REF_PREFIX = `__sr_${Date.now()}`

export default class Race {
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
