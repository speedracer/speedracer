// Native
const EventEmitter = require('events')

// Packages
const chromeRemote = require('chrome-remote-interface')
const debug = require('debug')('driver')

const disabledByDefault = (category) => `disabled-by-default-${category}`

const categories = [
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
  constructor(chrome, { port }) {
    super()
    this.chrome = chrome
    this.port = port
    this.collectedEvents = []
    this.status = {
      bufferUsage: 0,
      collectedEvents: 0
    }

    const { Page, Tracing } = this.chrome

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

  loadFile(file) {
    debug('load file %s', file)
    const search = file.slice(0, file.lastIndexOf('.'))
    const url = `http://localhost:${this.port}/${search}`
    const { Page } = this.chrome
    return Page.navigate({ url })
  }

  startTracing() {
    debug('start tracing')

    const { Tracing } = this.chrome

    return Tracing.start({
      categories: categories.join(','),
      options: 'sampling-frequency=1000',
      bufferUsageReportingInterval: 500
    }).then(() => {
      debug('tracing started')
    })
  }

  stopTracing() {
    debug('stop tracing')

    const { Tracing, HeapProfiler } = this.chrome

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

  close() {
    this.chrome.close()
  }
}

module.exports = config => (
  new Promise((resolve, reject) => {
    chromeRemote(chrome => {
      const driver = new Driver(chrome, { port: config.port })
      resolve(driver)
    })
    .on('error', reject)
  })
)
