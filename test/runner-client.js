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

test.cb('run a race', t => {
  const fn = sinon.spy()
  const client = new RunnerClient()
  client.enqueueRace('foo', fn)
  setTimeout(() => {
    t.true(fn.calledOnce)
    checkMessageSequence(t, client)
    t.end()
  }, CI ? 100 : 0)
})

test.cb('run an async race', t => {
  const fn = sinon.stub().callsFake(() => Promise.resolve())
  const client = new RunnerClient()
  client.enqueueRace('foo', fn)
  // Use setTimeout here because of Promise#then
  setTimeout(() => {
    t.true(fn.calledOnce)
    checkMessageSequence(t, client)
    t.end()
  }, CI ? 100 : 10)
})

test.cb('run multiple races in band', t => {
  const client = new RunnerClient()
  const fn1 = sinon.spy()
  const fn2 = sinon.stub().callsFake(() => Promise.resolve())
  const fn3 = sinon.spy()
  client.enqueueRace('foo', fn1)
  client.enqueueRace('bar', fn2)
  client.enqueueRace('baz', fn3)
  // Use setTimeout here because of Promise#then
  setTimeout(() => {
    t.true(fn1.calledOnce)
    t.true(fn2.calledAfter(fn1))
    t.true(fn3.calledAfter(fn2))
    checkMessageSequence(t, client)
    t.end()
  }, CI ? 100 : 10)
})

test.cb('handle exception in a race', t => {
  const client = new RunnerClient()
  const fnThrow = () => { throw new Error('error') }
  client.enqueueRace('foo', fnThrow, false)
  client.enqueueRace('bar', fnThrow, true)
  client.enqueueRace('baz', () => {}, false)
  setTimeout(() => {
    checkMessageSequence(t, client)
    t.end()
  }, CI ? 100 : 0)
})
