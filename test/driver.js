// Packages
import delay from 'delay'
import sinon from 'sinon'
import test from 'ava'

// Ours
import { Page, Tracing } from './helpers/mock-chrome-remote'
import createDriver from '../lib/driver'

test.afterEach(t => {
  Object.keys(Page).concat(Object.keys(Tracing))
    .map(k => Page[k] || Tracing[k])
    .filter(f => typeof f === 'function')
    .forEach(f => f.reset())
})

test('load a file', async t => {
  const driver = await createDriver({ port: 3000 })
  await driver.loadFile('test/fixtures/fast.js')
  t.snapshot(Page.navigate.args)
  driver.close()
})

test('trace a file', async t => {
  const handler = sinon.spy()
  const driver = await createDriver({ port: 3000 })
  driver.on('status', handler)
  await driver.loadFile('test/fixtures/fast.js')
  await driver.startTracing()
  await driver.stopTracing()
  t.true(Tracing.start.calledOnce)
  t.snapshot(handler.args)
  driver.close()
})

test('collect events', async t => {
  const driver = await createDriver({ port: 3000 })
  await driver.loadFile('test/fixtures/fast.js')
  await driver.startTracing()
  await delay(0)
  await driver.stopTracing()
  t.true(Tracing.callbacks.dataCollected.calledOnce)
  t.snapshot(Tracing.callbacks.dataCollected.args)
  driver.close()
})
