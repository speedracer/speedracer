import test from 'ava'
import using from 'p-using'
import { has } from 'lodash'
import { stubExecFileOnce } from 'stub-spawn-once'

import NodeTracer from '../../lib/tracers/node'

test.serial.skip('trace a simple race', async t => {
  await using(NodeTracer(), async tracer => {
    const serie = await tracer.trace(require('../fixtures/artifacts/primes'))
    t.true(has(serie, 'races[0].trace.traceEvents'))
  })
})

test.serial('explode if node is not compatible', async t => {
  stubExecFileOnce('node', 0, 'v6.0.0', '')
  const error = await t.throws(NodeTracer())
  t.is(error.code, 'NODE_OLD_VERSION')
  t.is(error.message, 'NodeJS >= 8 is required')
})
