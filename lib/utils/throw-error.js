import { assignIn, get, isString } from 'lodash'

import { ERRORS } from '../constants'

export default function throwError(code = 'UNKNOWN_ERROR', props = {}) {
  if (isString(props)) {
    props = { message: props }
  }

  const errorMessage = props.message || get(ERRORS, code)

  const error = new Error(errorMessage)
  assignIn(error, props, { code })

  throw error
}
