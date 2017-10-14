const babylon = require('babylon')
const generate = require('babel-generator').default
const t = require('babel-types')
const template = require('babel-template')
const traverse = require('babel-traverse').default

const { Race, Serie } = require('../core')
const { throwError } = require('../utils')

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

module.exports = async function RacesCollector(options) {
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
