import puppeteer from 'puppeteer'
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

const startTracing = (client) => {
  return client.send('Tracing.start', {
    transferMode: 'ReturnAsStream',
    categories: categories.join(','),
    options: 'sampling-frequency=1000',
    bufferUsageReportingInterval: 500
  })
}

const stopTracing = (client) => {
  const readTraces = async (handle) => {
    const buffer = []
    let eof = false

    while (!eof) {
      let response = await client.send('IO.read', { handle })
      buffer.push(response.data)
      eof = response.eof
    }

    await client.send('IO.close', { handle })
    return JSON.parse(join(buffer, ''))
  }

  return new Promise(resolve => {
    client.once('Tracing.tracingComplete', event => {
      readTraces(event.stream).then(resolve)
    })
    client.send('Tracing.end', {})
  })
}

class ChromeTracer {
  constructor(browser) {
    this.browser = browser
  }

  async trace(serie) {
    const page = await this.browser.newPage()
    const client = page._client

    await page.evaluate(serie.code)

    for (const race of serie.races) {
      await startTracing(client)
      await page.evaluate(`${race.ref}()`)
      const events = await stopTracing(client)

      race.attachEvents(events)
    }

    return serie
  }

  async dispose() {
    await this.browser.close()
  }
}

export default async function ChromeTracerFactory(options) {
  const browser = await puppeteer.launch()

  const tracer = new ChromeTracer(browser)
  return tracer
}
