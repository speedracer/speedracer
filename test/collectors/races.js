import test from 'ava'
import { map, omit, replace, pipe, update } from 'lodash/fp'

import Collector from '../../lib/collectors/races'
import { readFile } from '../../lib/utils'

const prepareSnapshot = pipe(
  update('code', replace(/(__sr_)(\d{13})(_\w{32})/g, '$1$3')),
  update('races', map(omit('ref')))
)

test('collect a simple race', async t => {
  const collect = await Collector()
  const inputCode = await readFile('test/fixtures/series/standalone.js')
  const serie = await collect(inputCode)
  const snapshot = prepareSnapshot(serie)
  t.snapshot(snapshot)
})

test('collect an await/async race', async t => {
  const collect = await Collector()
  const inputCode = await readFile('test/fixtures/series/standalone-async.js')
  const serie = await collect(inputCode)
  const snapshot = prepareSnapshot(serie)
  t.snapshot(snapshot)
})

test('collect a race that use an arrow function', async t => {
  const collect = await Collector()
  const inputCode = await readFile('test/fixtures/series/standalone-async-arrow.js')
  const serie = await collect(inputCode)
  const snapshot = prepareSnapshot(serie)
  t.snapshot(snapshot)
})

test('collect multiple races', async t => {
  const collect = await Collector()
  const inputCode = await readFile('test/fixtures/series/standalone-multiple.js')
  const serie = await collect(inputCode)
  const snapshot = prepareSnapshot(serie)
  t.snapshot(snapshot)
})

test('ignore an empty serie', async t => {
  const collect = await Collector()
  const inputCode = await readFile('test/fixtures/series/empty.js')
  const serie = await collect(inputCode)
  t.is(serie, null)
})

test('ignore a serie containing no races', async t => {
  const collect = await Collector()
  const inputCode = await readFile('test/fixtures/series/no-race.js')
  const serie = await collect(inputCode)
  t.is(serie, null)
})

test('explode if a serie contains invalid code', async t => {
  const collect = await Collector()
  const inputCode = await readFile('test/fixtures/series/invalid.js')
  const error = await t.throws(collect(inputCode))
  t.is(error.code, 'PARSE_ERROR')
  t.is(error.message, 'Unterminated string constant (2:11)')
})
