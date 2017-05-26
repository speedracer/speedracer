const commonjs = require('rollup-plugin-commonjs')
const debug = require('debug')('default-loader')
const resolve = require('rollup-plugin-node-resolve')
const rollup = require('rollup')

class ES6Loader {
  loadFile({ file, options }) {
    debug('loading', file, options)

    return rollup.rollup({
      entry: file,
      plugins: [
        {
          resolveId(id, code) {
            if (id === 'speedracer') {
              return options.runtimePath
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
    .then(bundle => {
      const { code } = bundle.generate({
        format: 'iife',
        moduleName: 'speedracer'
      })

      debug('bundle generated', `${code.length}B`)
      return code
    })
  }
}

module.exports = () => (
  new ES6Loader()
)
