import commonjs from 'rollup-plugin-commonjs'
import resolve from 'rollup-plugin-node-resolve'
import template from 'babel-template'
import generate from 'babel-generator'
import traverse from 'babel-traverse'
import * as babylon from 'babylon'
import * as t from 'babel-types'
import { rollup } from 'rollup'
import { defaults, endsWith, some } from 'lodash'

import { createDeduplicator, raceIdFrom, raceRefFrom, throwError } from '../utils'

export default async function JavaScriptLoader(options) {
  options = defaults(options, {
    extensions: ['.js'],
    plugins: []
  })

  const races = []

  const deduplicateNames = createDeduplicator()

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

  const isRaceExpression = (expression) => {
    return (
      t.isCallExpression(expression) &&
      expression.callee.name === 'race'
    )
  }

  const collectRaceName = (expression) => {
    if (!t.isStringLiteral(expression.arguments[0])) {
      throwError({
        code: 'COLLECTOR_INVALID_RACE_NAME',
        message: 'The first argument of a race must be a string.'
      })
    }

    const name = expression.arguments[0].value
    return deduplicateNames(name)
  }

  const collectRaces = (inputCode) => {
    let ast

    try {
      ast = babylon.parse(inputCode)
    }
    catch (error) {
      throwError('PARSE_ERROR', error)
    }

    traverse(ast, {
      ExpressionStatement(path) {
        const { expression } = path.node
        if (!isRaceExpression(expression)) return

        const name = collectRaceName(expression)
        const id = raceIdFrom(name)
        const ref = raceRefFrom(id)

        path.replaceWith(
          template(`const ${ref} = BODY`)({
            BODY: expression.arguments[1]
          })
        )

        races.push({ name, id, ref })
        path.skip()
      }
    })

    if (races.length === 0) return null

    const { code } = generate(ast)
    return { code, races }
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

  return async function loadRaces(filename) {
    if (!canLoad(filename)) return null

    try {
      const bundle = await rollup(inputOptions(filename))
      const { code } = await bundle.generate(outputOptions(filename))

      return collectRaces(code)
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
