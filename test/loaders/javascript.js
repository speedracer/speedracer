import test from 'ava'
import { spy } from 'sinon'

import JavaScriptLoader from '../../lib/loaders/javascript'

test('load the code of a file', async t => {
  const loadCode = await JavaScriptLoader()
  const code = await loadCode('test/fixtures/series/no-race.js')
  t.snapshot(code)
})

test('bundle a file using ES6 modules', async t => {
  const loadCode = await JavaScriptLoader()
  const code = await loadCode('test/fixtures/series/primes.js')
  t.snapshot(code)
})

test('accept additional file extensions', async t => {
  const loadCode = await JavaScriptLoader({ extensions: ['.mjs'] })
  const code = await loadCode('test/fixtures/series/no-race.mjs')
  t.snapshot(code)
})

test('accept rollup plugins', async t => {
  const plugin = { resolveId: spy() }
  const loadCode = await JavaScriptLoader({ plugins: [plugin] })
  const code = await loadCode('test/fixtures/series/primes.js')
  t.true(plugin.resolveId.called)
  t.snapshot(code)
})

test('ignore an empty file', async t => {
  const loadCode = await JavaScriptLoader()
  const res = await loadCode('test/fixtures/series/empty.js')
  t.is(res, null)
})

test('ignore if a file has a wrong extension', async t => {
  const loadCode = await JavaScriptLoader()
  const res = await loadCode('test/fixtures/series/hello.mjs')
  t.is(res, null)
})

test('explode if a file does not exists', async t => {
  const loadCode = await JavaScriptLoader()
  const error = await t.throws(loadCode('404.js'))
  t.is(error.code, 'FILE_NOTFOUND')
  t.is(error.message, 'File could not be found')
  t.is(error.filename, '404.js')
})

test('explode if a file contains invalid code', async t => {
  const loadCode = await JavaScriptLoader()
  const error = await t.throws(loadCode('test/fixtures/series/invalid.js'))
  t.is(error.code, 'PARSE_ERROR')
  t.is(error.message, 'Unterminated string constant')
  t.is(error.filename, 'test/fixtures/series/invalid.js')
})
