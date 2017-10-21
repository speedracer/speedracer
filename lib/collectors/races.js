import * as babylon from 'babylon'
import * as t from 'babel-types'
import template from 'babel-template'
import generate from 'babel-generator'
import traverse from 'babel-traverse'

import { Race, Serie } from '../core'
import { throwError } from '../utils'

const isRaceExpression = (expression) => {
  return (
    t.isCallExpression(expression) &&
    expression.callee.name === 'race'
  )
}

const getRaceName = (expression) => {
  if (!t.isStringLiteral(expression.arguments[0])) {
    throwError({
      code: 'COLLECTOR_INVALID_RACE_NAME',
      message: 'The first argument of a race must be a string.'
    })
  }
  return expression.arguments[0].value
}

export default async function RacesCollector(options) {
  return async function collect(inputCode) {
    const races = []
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

        const raceName = getRaceName(expression)
        const race = new Race(raceName)

        path.replaceWith(
          template(`const ${race.ref} = BODY`)({
            BODY: expression.arguments[1]
          })
        )

        races.push(race)
        path.skip()
      }
    })

    if (races.length === 0) return null

    const { code } = generate(ast)
    return new Serie(code, races)
  }
}
