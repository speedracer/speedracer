import test from 'ava'
import using from 'p-using'
import { has } from 'lodash'

import ChromeTracer from '../../lib/tracers/chrome'

test.serial('trace a simple race', async t => {
  await using(ChromeTracer(), async tracer => {
    const serie = await tracer.trace(require('../fixtures/artifacts/primes'))
    t.true(has(serie, 'races[0].trace.metadata'))
    t.true(has(serie, 'races[0].trace.traceEvents'))
  })
})

test.serial('trace multiple races', async t => {
  await using(ChromeTracer(), async tracer => {
    const serie = await tracer.trace(require('../fixtures/artifacts/multiple'))
    t.true(has(serie, 'races[0].trace.metadata'))
    t.true(has(serie, 'races[0].trace.traceEvents'))
    t.true(has(serie, 'races[1].trace.metadata'))
    t.true(has(serie, 'races[1].trace.traceEvents'))
  })
})
