// native
const fs = require('fs')
const os = require('os')
const net = require('net')
const { spawn } = require('child_process')

// Packages
const chalk = require('chalk')
const delay = require('delay')
const pify = require('pify')
const wrap = require('word-wrap')

// Ours
const { emphasis } = require('./output')

const port = 9222

const macBin = '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary'

const locateChrome = () =>
  new Promise((resolve, reject) => {
    const bin = process.env.SPEEDRACER_CHROME || macBin
    // XXX

    pify(fs.stat)(bin)
      .then(() => resolve(bin))
      .catch(() => {
        /* eslint-disable */
        console.error(wrap(`
${chalk.red('Chrome Canary not found.')}
  For now only Chrome Canary on Mac OS is detected by default.
  But don't worry, you can override it by setting the environement variable ${emphasis('SPEEDRACER_CHROME')} to your Chrome Canary executable path.
  We are waiting than headless mode lands into maintream Chrome so we can use modules to safely locate Chrome on your machine.

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

    locateChrome()
      .then(binPath => spawn(binPath, flags))
      .then(resolve)
  })

module.exports = function() {
  return spawnChrome().then(waitUntilReady)
}
