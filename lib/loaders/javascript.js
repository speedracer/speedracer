import commonjs from 'rollup-plugin-commonjs'
import resolve from 'rollup-plugin-node-resolve'
import { rollup } from 'rollup'
import { defaults, endsWith, some } from 'lodash'

import { throwError } from '../utils'

export default async function JavaScriptLoader(options) {
  options = defaults(options, {
    extensions: ['.js'],
    plugins: []
  })

  const canLoad = (filename) => (
    some(options.extensions, ext => endsWith(filename, ext))
  )

  const handleWarning = (warning) => {
    if (warning.code === 'EMPTY_BUNDLE') {
      throwError('FILE_EMPTY')
    }

    // TODO: debug logging only
    console.warn(warning)
  }

  const inputOptions = (filename) => ({
    input: filename,
    plugins: [
      resolve({ jsnext: true, main: true }),
      commonjs(),
      ...options.plugins
    ],
    onwarn: handleWarning
  })

  const outputOptions = (filename) => ({
    format: 'iife'
  })

  return async function loadCode(filename) {
    if (!canLoad(filename)) return null

    try {
      const bundle = await rollup(inputOptions(filename))
      const { code } = await bundle.generate(outputOptions(filename))
      return code
    }
    catch (error) {
      const { code, message } = error

      if (code === 'FILE_EMPTY') return null
      if (code === 'UNRESOLVED_ENTRY') throwError('FILE_NOTFOUND', { filename })
      if (code === 'PARSE_ERROR') throwError('PARSE_ERROR', { message, filename })
      return throwError('UNKNOWN_ERROR', error)
    }
  }
}
