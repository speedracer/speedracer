import { assign } from 'lodash'

export default class Trace {
  constructor(events) {
    assign(this, events)
  }
}
