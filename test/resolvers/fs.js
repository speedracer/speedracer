import test from 'ava'
import { map, replace } from 'lodash/fp'

import FileSystemResolver from '../../lib/resolvers/fs'

const prepareSnapshot = map(
  replace(/^\/.*\/(test\/.*)/g, '$1')
)

test('resolve a filename', async t => {
  const resolve = await FileSystemResolver()
  const res = await resolve('test/fixtures/series/standalone.js')
  const files = prepareSnapshot(res)
  t.snapshot(files)
})

test('resolve a wildcard', async t => {
  const resolve = await FileSystemResolver()
  const res = await resolve('test/fixtures/series/*.js')
  const files = prepareSnapshot(res)
  t.snapshot(files)
})
