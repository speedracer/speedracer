// Packages
import sinon from 'sinon'
import test from 'ava'

// Ours
import './helpers/mock-ws'
import { RunnerClient } from '../lib/runner-client'

const CI = !!process.env.CI

const checkMessageSequence = (t, client) => {
  t.snapshot(client.ws.send.args)
}

test.cb('execute a run', t => {
  const fn = sinon.spy()
  const client = new RunnerClient()
  client.enqueueRun('foo', fn)
  setTimeout(() => {
    t.true(fn.calledOnce)
    checkMessageSequence(t, client)
    t.end()
  }, CI ? 100 : 0)
})

test.cb('execute an async run', t => {
  const fn = sinon.stub().callsFake(() => Promise.resolve())
  const client = new RunnerClient()
  client.enqueueRun('foo', fn)
  // Use setTimeout here because of Promise#then
  setTimeout(() => {
    t.true(fn.calledOnce)
    checkMessageSequence(t, client)
    t.end()
  }, CI ? 100 : 10)
})

test.cb('execute multiple runs in band', t => {
  const client = new RunnerClient()
  const fn1 = sinon.spy()
  const fn2 = sinon.stub().callsFake(() => Promise.resolve())
  const fn3 = sinon.spy()
  client.enqueueRun('foo', fn1)
  client.enqueueRun('bar', fn2)
  client.enqueueRun('baz', fn3)
  // Use setTimeout here because of Promise#then
  setTimeout(() => {
    t.true(fn1.calledOnce)
    t.true(fn2.calledAfter(fn1))
    t.true(fn3.calledAfter(fn2))
    checkMessageSequence(t, client)
    t.end()
  }, CI ? 100 :10)
})

test.cb('handle exception in a run', t => {
  const client = new RunnerClient()
  const fnThrow = () => { throw new Error('error') }
  client.enqueueRun('foo', fnThrow, false)
  client.enqueueRun('bar', fnThrow, true)
  client.enqueueRun('baz', () => {}, false)
  setTimeout(() => {
    checkMessageSequence(t, client)
    t.end()
  }, CI ? 100 : 0)
})
