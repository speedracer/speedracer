// Native
const path = require('path')

// Packages
const commonjs = require('rollup-plugin-commonjs')
const resolve = require('rollup-plugin-node-resolve')
const rollupStream = require('rollup-stream')

const createBundleStream = filename =>
rollupStream({
  entry: filename,
  format: 'iife',
  moduleName: 'run',
  plugins: [
    {
      resolveId(id) {
        if (id === 'speedracer') {
          return path.resolve(__dirname, './runner-client.js')
        }
      }
    },
    resolve({ jsnext: true, main: true }),
    commonjs()
  ]
})

module.exports = createBundleStream
