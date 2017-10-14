const puppeteer = require('puppeteer')

const Tracing = require('./tracing')

class ChromeTracer {
  constructor(browser) {
    this.browser = browser
  }

  async trace(serie) {
    const page = await this.browser.newPage()
    const tracing = new Tracing(page._client)

    await page.evaluate(serie.code)

    for (const race of serie.races) {
      await tracing.start()
      await page.evaluate(`${race.ref}()`)
      const events = await tracing.stop()

      race.attachEvents(events)
    }

    return serie
  }

  async dispose() {
    await this.browser.close()
  }
}

module.exports = async function ChromeTracerFactory(options) {
  const browser = await puppeteer.launch()

  const tracer = new ChromeTracer(browser)
  return tracer
}
