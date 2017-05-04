// Packages
import getStream from 'get-stream'
import test from 'ava'

// Ours
import createBundleStream from '../lib/bundler'

test('create a es6 bundle', async t => {
  const content = await getStream(
    createBundleStream('./test/fixtures/bundles/es6.js', { port: 3001 })
  )
  t.snapshot(content)
})

test('create a common js bundle', async t => {
  const content = await getStream(
    createBundleStream('./test/fixtures/bundles/cjs.js', { port: 3001 })
  )
  t.snapshot(content)
})

test('bundle runner client', async t => {
  const content = await getStream(
    createBundleStream('./test/fixtures/bundles/runner-client.js', { port: 3001 })
  )
  t.snapshot(content)
})

test('bundle a runner client with a custom port', async t => {
  const content = await getStream(
    createBundleStream('./test/fixtures/bundles/runner-client.js', { port: 1337 })
  )
  t.snapshot(content)
})
