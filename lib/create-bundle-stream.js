// Native
const path = require('path')

// Packages
const rollupStream = require('rollup-stream')
const resolve = require('rollup-plugin-node-resolve')
const commonjs = require('rollup-plugin-commonjs')

const createBundleStream = filename =>
  rollupStream({
    entry: filename,
    format: 'iife',
    moduleName: 'run',
    plugins: [
      {
        resolveId(id) {
          if (id === 'speedracer') {
            return path.resolve(__dirname, './runtime.js')
          }
        }
      },
      resolve({ jsnext: true, main: true }),
      commonjs()
    ]
  })

module.exports = createBundleStream
