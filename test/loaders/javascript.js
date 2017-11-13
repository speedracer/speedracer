import test from 'ava'
import { spy } from 'sinon'
import { map, omit, replace, pipe, update } from 'lodash/fp'

import JavaScriptLoader from '../../lib/loaders/javascript'

const prepareSnapshot = pipe(
  update('code', replace(/(__sr_)(\d{13})(_\w{32})/g, '$1$3')),
  update('races', map(omit('ref')))
)

test('load the code of a file', async t => {
  const load = await JavaScriptLoader()
  const res = await load('test/fixtures/series/standalone.js')
  const { code } = prepareSnapshot(res)
  t.snapshot(code)
})

test('bundle a file using ES6 modules', async t => {
  const load = await JavaScriptLoader()
  const res = await load('test/fixtures/series/primes.js')
  const { code } = prepareSnapshot(res)
  t.snapshot(code)
})

test('accept additional file extensions', async t => {
  const load = await JavaScriptLoader({ extensions: ['.mjs'] })
  const res = await load('test/fixtures/series/standalone.mjs')
  const { code } = prepareSnapshot(res)
  t.snapshot(code)
})

test('accept rollup plugins', async t => {
  const plugin = { resolveId: spy() }
  const load = await JavaScriptLoader({ plugins: [plugin] })
  await load('test/fixtures/series/primes.js')
  t.true(plugin.resolveId.called)
})

test('collect a simple race', async t => {
  const load = await JavaScriptLoader()
  const res = await load('test/fixtures/series/primes.js')
  const { races } = prepareSnapshot(res)
  t.snapshot(races)
})

test('collect an await/async race', async t => {
  const load = await JavaScriptLoader()
  const res = await load('test/fixtures/series/standalone-async.js')
  const { races } = prepareSnapshot(res)
  t.snapshot(races)
})

test('collect a race that use an arrow function', async t => {
  const load = await JavaScriptLoader()
  const res = await load('test/fixtures/series/standalone-async-arrow.js')
  const { races } = prepareSnapshot(res)
  t.snapshot(races)
})

test('collect multiple races', async t => {
  const load = await JavaScriptLoader()
  const res = await load('test/fixtures/series/standalone-multiple.js')
  const { races } = prepareSnapshot(res)
  t.snapshot(races)
})

test('collect races accross several files', async t => {
  const load = await JavaScriptLoader()
  const res = await load('test/fixtures/series/multiple.js')
  const { races } = prepareSnapshot(res)
  t.snapshot(races)
})

test('handle duplicate races', async t => {
  const load = await JavaScriptLoader()
  const res = await load('test/fixtures/series/duplicate.js')
  const { races } = prepareSnapshot(res)
  t.snapshot(races)
})

test('map races id to corresponding functions', async t => {
  const load = await JavaScriptLoader()
  const res = await load('test/fixtures/series/standalone-multiple.js')
  const { code, races } = prepareSnapshot(res)
  races.forEach(race => {
    t.regex(code, new RegExp(race.id))
  })
})

test('ignore an empty file', async t => {
  const load = await JavaScriptLoader()
  const res = await load('test/fixtures/series/empty.js')
  t.is(res, null)
})

test('ignore a file without races', async t => {
  const load = await JavaScriptLoader()
  const res = await load('test/fixtures/series/no-race.js')
  t.is(res, null)
})

test('ignore if a file has a wrong extension', async t => {
  const load = await JavaScriptLoader()
  const res = await load('test/fixtures/series/hello.mjs')
  t.is(res, null)
})

test('explode if a file does not exists', async t => {
  const load = await JavaScriptLoader()
  const error = await t.throws(load('404.js'))
  t.is(error.code, 'FILE_NOTFOUND')
  t.is(error.message, 'File could not be found')
  t.is(error.filename, '404.js')
})

test.skip('explode if a file contains invalid code', async t => {
  const load = await JavaScriptLoader()
  const error = await t.throws(load('test/fixtures/series/invalid.js'))
  t.is(error.code, 'PARSE_ERROR')
  t.is(error.message, 'Unterminated string constant')
  t.is(error.filename, 'test/fixtures/series/invalid.js')
})
