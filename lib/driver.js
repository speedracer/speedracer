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
  constructor(chrome, options) {
    super()
    this.chrome = chrome
    this.options = options
    this.collectedEvents = []
  }

  loadFile(file) {
    debug('load file %s', file)

    const { Page, Tracing } = this.chrome

    Tracing.bufferUsage(usage => {
      debug(`buffer usage: ${(usage.percentFull * 100).toFixed(2)}%`)
      this.emit('status', `buffer usage: ${(usage.percentFull * 100).toFixed(2)}%`)
    })

    Tracing.dataCollected(data => {
      data.value = data.value || []
      debug('events collected', data.value.length)
      this.collectedEvents = this.collectedEvents.concat(data.value)
    })

    Tracing.tracingComplete(() => {
      debug('tracing complete')
      this.emit('tracing:complete')
      this.emit('status', 'tracing complete')
    })

    const search = file.slice(0, file.lastIndexOf('.'))
    const url = `http://localhost:${this.options.port}/${search}`

    Page.enable()
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
      this.emit('status', 'tracing started')
    })
  }

  stopTracing() {
    debug('stop tracing')

    const { Tracing, HeapProfiler } = this.chrome

    return Tracing.end()
      .then(() => new Promise(resolve => {
        this.once('tracing:complete', () => {
          // Force a garbage collection for next run
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

module.exports = options =>
new Promise((resolve, reject) => {
  chromeRemote(chrome => resolve(new Driver(chrome, options)))
    .on('error', reject)
})
