// native
const os = require('os')
const net = require('net')
const { spawn } = require('child_process')

// Packages
const chalk = require('chalk')
const debug = require('debug')('chrome-launcher')
const delay = require('delay')
const locateChrome = require('locate-chrome')
const wrap = require('word-wrap')

// Ours
const display = require('../display')
const { fileExists } = require('../.internal/util')

const port = 9222

// XXX
const canaryBin = '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary'

const locateChromePath = () =>
new Promise((resolve, reject) => {
  debug('locate chrome')

  const binPath = process.env.SPEEDRACER_CHROME || canaryBin
  debug('trying: %s', binPath)

  // Prioritize OS X Chrome Canary, if not try to locate Chrome
  fileExists(binPath)
    .then(
      () => resolve(binPath),
      () => {
        debug('auto locate chrome')
        return locateChrome()
      }
    )
    .then(resolve, () => {
      /* eslint-disable */
      console.error(wrap(`
${chalk.red('Chrome was not found.')}
But don't worry, if it's installed in a non-standard location you set ${display.emphasis('SPEEDRACER_CHROME')} environement variable to your Chrome executable path.

`, { width: process.stdout.columns - 2 }))
      /* eslint-enable */

      process.exit(1)
    })
})

const isDebuggerReady = chrome =>
new Promise((resolve, reject) => {
  const client = net.createConnection(port)

  const cleanup = () => {
    client.removeAllListeners()
    client.end()
    client.destroy()
    client.unref()
  }

  client.once('error', err => {
    debug('chrome error: %s', err)
    cleanup()
    resolve(false)
  })
  client.once('connect', () => {
    debug('chrome ready')
    cleanup()
    resolve(true)
  })
})

const waitUntilReady = chrome =>
new Promise((resolve, reject) => {
  let retries = 0

  ;(function poll() {
    retries++

    debug('check debugger ready: %d', retries)
    isDebuggerReady(chrome)
      .then(isReady => {
        if (isReady) return resolve(chrome)
        if (retries > 10) {
          return reject(new Error('Chrome Debugger could not be reached.'))
        }
        delay(500).then(poll)
      })
  })()
})

const spawnChrome = options =>
new Promise((resolve, reject) => {
  const flags = [
    options.headless ? '--headless' : '',
    `--remote-debugging-port=${port}`,
    // https://chromium.googlesource.com/chromium/src/+/lkgr/headless/README.md
    '--disable-gpu',
    // Disable built-in Google Translate service
    '--disable-translate',
    // Disable all chrome extensions entirely
    '--disable-extensions',
    // Disable various background network services, including extension updating,
    //   safe browsing service, upgrade detector, translate, UMA
    '--disable-background-networking',
    // Disable fetching safebrowsing lists, likely redundant due to disable-background-networking
    '--safebrowsing-disable-auto-update',
    // Disable syncing to a Google account
    '--disable-sync',
    // Disable reporting to UMA, but allows for collection
    '--metrics-recording-only',
    // Disable installation of default apps on first run
    '--disable-default-apps',
    // Skip first run wizards
    '--no-first-run',
    // Place Chrome profile in a custom location we'll rm -rf later
    `--user-data-dir=${os.tmpdir()}`,
    // Expose garbage collector
    '--js-flags="--expose-gc"'
  ]

  if ('string' === typeof options.flags) {
    flags.push(options.flags.split(' '))
  }

  locateChromePath()
    .then(binPath => {
      debug('chrome found: %s', binPath)
      return binPath
    })
    .then(binPath => {
      debug('spawn chrome with flags: %s', flags)
      return spawn(binPath, flags)
    })
    .then(chrome => {
      // Unify the way of closing modules
      chrome.close = chrome.kill
      return chrome
    })
    .then(resolve)
})

module.exports = config => (
  spawnChrome({
    flags: config.chromeFlags,
    headless: config.headless
  })
  .then(waitUntilReady)
)
