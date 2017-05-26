const debug = require('debug')('driver')
const EventEmitter = require('events')

const disabledByDefault = (category) => `disabled-by-default-${category}`

const defaultCategories = [
  '-*',
  'devtools.timeline',
  'v8.execute',
  disabledByDefault('devtools.timeline'),
  disabledByDefault('devtools.timeline.frame'),
  'toplevel',
  'blink.console',
  'blink.user_timing',
  'devtools.timeline.async',
  disabledByDefault('v8.runtime_stats_sampling'),
  disabledByDefault('v8.cpu_profiler'),
  disabledByDefault('v8.cpu_profiler.hires'),
  disabledByDefault('devtools.timeline.stack'),
  disabledByDefault('devtools.timeline.invalidationTracking')
]

class Driver extends EventEmitter {
  constructor(chromeRemote, { port }) {
    super()

    this.categories = defaultCategories
    this.chromeRemote = chromeRemote
    this.port = port
    this.collectedEvents = []
    this.status = {
      bufferUsage: 0,
      collectedEvents: 0
    }

    const { Page, Tracing } = this.chromeRemote

    Tracing.bufferUsage(usage => {
      debug(`buffer usage: ${(usage.percentFull * 100).toFixed(2)}%`)

      this.status.bufferUsage = usage.percentFull
      this.emit('status', this.status)
    })

    Tracing.dataCollected(data => {
      data.value = data.value || []
      debug('events collected', data.value.length)

      this.collectedEvents = this.collectedEvents.concat(data.value)

      this.status.collectedEvents = this.collectedEvents.length
      this.emit('status', this.status)
    })

    Tracing.tracingComplete(() => {
      debug('tracing complete')

      this.emit('tracing:complete')
    })

    debug('ready')
    Page.enable()
  }

  getCategories() {
    return this.categories
  }

  setCategories(categories) {
    debug('set categories', categories)
    this.categories = categories
  }

  loadFile(file) {
    debug('load file %s', file)
    const search = file.slice(0, file.lastIndexOf('.'))
    const url = `http://localhost:${this.port}/${search}`
    const { Page } = this.chromeRemote
    return Page.navigate({ url })
  }

  startTracing() {
    debug('start tracing')

    const { Tracing } = this.chromeRemote

    return Tracing.start({
      categories: this.categories.join(','),
      options: 'sampling-frequency=1000',
      bufferUsageReportingInterval: 500
    }).then(() => {
      debug('tracing started')
    })
  }

  stopTracing() {
    debug('stop tracing')

    const { Tracing, HeapProfiler } = this.chromeRemote

    return Tracing.end()
      .then(() => new Promise(resolve => {
        this.once('tracing:complete', () => {
          // Force a garbage collection for next race
          HeapProfiler.collectGarbage()

          const events = this.collectedEvents.slice()
          this.collectedEvents.length = 0
          resolve(events)
        })
      }))
  }

  close() {}
}

module.exports = (chromeRemote, options) => (
  new Driver(chromeRemote, { port: options.port })
)
