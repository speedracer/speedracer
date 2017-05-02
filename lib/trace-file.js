// Native
const { createServer } = require('http')

// Packages
const chromeRemote = require('chrome-remote-interface')

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

const traceFile = (task, file, { duration }) => {
  let events = []

  // remove extension
  file = file.slice(0, file.lastIndexOf('.'))

  return new Promise((resolve, reject) => {
    chromeRemote(chrome => {
      const { Page, Tracing } = chrome
      let timerId

      const tracingEnd = type => () => {
        clearTimeout(timerId)
        task.output = `run completed (${type})`
        Tracing.end()
      }

      // Listen to a user call to `speedracer.end()`
      const server = createServer(tracingEnd('user')).listen(3001)

      Page.enable()
      Page.navigate({ url: `http://localhost:3000/${file}` })

      Tracing.start({
        categories: categories.join(','),
        options: 'sampling-frequency=1000',
        bufferUsageReportingInterval: 500
      }).then(() => {
        task.output = 'run started'
        timerId = setTimeout(tracingEnd('timeout'), duration)
      })
      Tracing.bufferUsage(usage => {
        task.output = `buffer usage: ${(usage.percentFull * 100).toFixed(2)}%`
      })
      Tracing.dataCollected(data => {
        events = events.concat(data.value)
      })
      Tracing.tracingComplete(() => {
        chrome.close()
        server.close()
        resolve(events)
      })
    })
    .on('error', reject)
  })
}

module.exports = traceFile
