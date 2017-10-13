// Native
const path = require('path')

// Packages
const commonjs = require('rollup-plugin-commonjs')
const debug = require('debug')('bundler')
const resolve = require('rollup-plugin-node-resolve')
const rollupStream = require('rollup-stream')

const createBundleStream = (filename, options) =>
rollupStream({
  entry: filename,
  format: 'iife',
  name: 'speedracer',
  plugins: [
    {
      resolveId(id, code) {
        if (id === 'speedracer') {
          return path.resolve(__dirname, './runner-client.js')
        }
      },
      transform(code, filename) {
        if (filename.endsWith('runner-client.js')) {
          return code.replace('this.port = 3001', `this.port = ${options.port}`)
        }
      }
    },
    resolve({ jsnext: true, main: true }),
    commonjs()
  ],
  onwarn: e => {
    debug(`warning: ${e.message}`)
  }
})

module.exports = createBundleStream
