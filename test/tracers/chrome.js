import test from 'ava'
import using from 'p-using'
import { has } from 'lodash'

import ChromeTracer from '../../lib/tracers/chrome'

test.serial('trace a simple race', async t => {
  await using(ChromeTracer(), async tracer => {
    const [ trace ] = await tracer.trace(require('../fixtures/artefacts/series/primes'))
    t.true(has(trace, 'metadata'))
    t.true(has(trace, 'traceEvents'))
  })
})

test.serial('trace multiple races', async t => {
  await using(ChromeTracer(), async tracer => {
    const [ trace1, trace2 ] = await tracer.trace(require('../fixtures/artefacts/series/multiple'))
    t.true(has(trace1, 'metadata'))
    t.true(has(trace1, 'traceEvents'))
    t.true(has(trace2, 'metadata'))
    t.true(has(trace2, 'traceEvents'))
  })
})
