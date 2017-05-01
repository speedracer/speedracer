// native
const fs = require('fs')
const os = require('os')
const net = require('net')
const { spawn } = require('child_process')

// Packages
const chalk = require('chalk')
const delay = require('delay')
const locateChrome = require('locate-chrome')
const pify = require('pify')
const wrap = require('word-wrap')

// Ours
const display = require('./display')

const port = 9222

// XXX
const canaryBin = '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary'

const locateChromePath = () =>
  new Promise((resolve, reject) => {
    const binPath = process.env.SPEEDRACER_CHROME || canaryBin

    // Prioritize OS X Chrome Canary, if not try to locate Chrome
    pify(fs.stat)(binPath)
      .then(() => resolve(binPath), () => locateChrome())
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

    client.once('error', () => {
      cleanup()
      resolve(false)
    })
    client.once('connect', () => {
      cleanup()
      resolve(true)
    })
  })

const waitUntilReady = chrome =>
  new Promise((resolve, reject) => {
    let retries = 0

    ;(function poll() {
      retries++

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

const spawnChrome = () =>
  new Promise((resolve, reject) => {
    const flags = [
      '--headless',
      `--remote-debugging-port=${port}`,
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

    locateChromePath()
      .then(binPath => spawn(binPath, flags))
      .then(resolve)
  })

module.exports = function() {
  return spawnChrome().then(waitUntilReady)
}
