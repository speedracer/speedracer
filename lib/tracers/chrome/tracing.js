import { join } from 'lodash'

const disabledByDefault = (category) => `disabled-by-default-${category}`

const categories = [
  '-*',
  'toplevel',
  'loading',
  'v8.execute',
  'devtools.timeline',
  'devtools.timeline.async',
  disabledByDefault('devtools.timeline.stack'),
  disabledByDefault('devtools.timeline'),
  disabledByDefault('devtools.timeline.frame'),
  'navigation',
  'blink.console',
  'blink.user_timing',
  disabledByDefault('v8.runtime_stats_sampling'),
  disabledByDefault('v8.cpu_profiler'),
  disabledByDefault('v8.cpu_profiler.hires')
]

export default class Tracing {
  constructor(client) {
    this.client = client
  }

  async start() {
    await this.client.send('Tracing.start', {
      transferMode: 'ReturnAsStream',
      categories: categories.join(','),
      options: 'sampling-frequency=1000',
      bufferUsageReportingInterval: 500
    })
  }

  stop() {
    return new Promise(resolve => {
      this.client.once('Tracing.tracingComplete', event => {
        this.readTraces(event.stream).then(resolve)
      })
      this.client.send('Tracing.end', {})
    })
  }

  async readTraces(handle) {
    const buffer = []
    let eof = false

    while (!eof) {
      let response = await this.client.send('IO.read', { handle })
      buffer.push(response.data)
      eof = response.eof
    }

    await this.client.send('IO.close', { handle })
    return JSON.parse(join(buffer, ''))
  }
}
